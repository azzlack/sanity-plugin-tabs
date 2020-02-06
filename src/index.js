import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { withDocument } from "part:@sanity/form-builder";
import { FormBuilderInput, patches } from "part:@sanity/form-builder";
import * as PathUtils from '@sanity/util/paths.js'
import WarningIcon from 'part:@sanity/base/warning-icon'
import Button from "part:@sanity/components/buttons/default";

import styles from "./tabs.css";

const {setIfMissing} = patches;

class Tabs extends React.Component {
  focusRef = React.createRef();

  static propTypes = {
    type: PropTypes.shape({
      fieldsets: PropTypes.array.isRequired,
      fields: PropTypes.array.isRequired
    }).isRequired,
    value: PropTypes.object,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func.isRequired
  };

  state = {
    activeTab: ""
  };

  focus = () => {
    if (this.focusRef.current && this.focusRef.current.focus) {
      this.focusRef.current.focus();
    }
  };

  getTabFields = tabName => {
    return this.props.type.fields.filter(f => f.fieldset == tabName);
  };

  flattenFields = arr => {
    var result = [];
    arr.forEach((a) => {
        result.push(a);
        if (a.type && Array.isArray(a.type.fields)) {
            result = result.concat(this.flattenFields(a.type.fields));
        }
    });
    return result;
  };

  trimChildPath = (path, childPath) => {
    return PathUtils.startsWith(path, childPath) ? PathUtils.trimLeft(path, childPath) : []
  }

  getFieldSet = (path) => {
    if (path && path.length > 0) {
      var f = this.props.type.fields.find(f => {
        return path.findIndex(f.name) > -1;
      });
      
      return f.fieldset;
    }
  }

  getTabMarkers = (tabName) => {
    var fields = this.flattenFields(this.getTabFields(tabName));
    var markers = fields.reduce((result, f) => {
      var fm = this.getFieldMarkers(f.name);
      if (fm && fm.length > 0) {
        result = result.concat(fm);
      }

      return result;
    }, []);

    return markers;
  }

  getFieldMarkers = (fieldName) => {
    return this.props.markers.filter(marker => PathUtils.startsWith([fieldName], marker.path))
      .map(marker => ({
        ...marker,
        path: this.trimChildPath([fieldName], marker.path)
      }));
  }

  getActiveTabFields = () => {
    if (this.state.activeTab !== "") {
      return this.getTabFields(this.state.activeTab);
    }

    return null;
  };

  onFieldChangeHandler = (field, fieldPatchEvent) => {
    const { onChange, type } = this.props;
    var e = fieldPatchEvent
                .prefixAll(field.name)
                .prepend(setIfMissing({ _type: type.name }));

    console.debug(`[Tabs] FieldChanged:`, field, e);

    onChange(e);
  };

  onTabClicked = fieldset => {
    this.setState({
      activeTab: fieldset.name
    });
  };

  componentDidMount() {
    if (this.state.activeTab === "" && this.props.type.fieldsets.length > 0) {
      this.setState({
        activeTab: this.props.type.fieldsets[0].name
      });
    }
  }

  render = () => {
    console.debug(`[Tabs] Props:`, this.props);

    const { type, value } = this.props;
    const tabFields = this.getActiveTabFields();

    return (
      <div className={styles.tabs}>
        {type.fieldsets &&
          type.fieldsets.length > 0 &&
          type.fieldsets[0].single !== true && (
            <div className={styles.tab_headers}>
              {type.fieldsets.map(fs => {
                var markers = this.getTabMarkers(fs.name);
                var validation = markers.filter(marker => marker.type === 'validation');
                var errors = validation.filter(marker => marker.level === 'error');
                var title = fs.title || "Other";

                return (
                  <Button
                    key={fs.name || "other"}
                    className={styles.tab}
                    color="primary"
                    inverted={this.state.activeTab == fs.name ? false : true}
                    onClick={() => this.onTabClicked(fs)}
                  >
                    {title}{errors.length > 0 && <WarningIcon className={styles.tab_header__error}/>}
                  </Button>
                );
              })}
            </div>
          )}
        <div className={styles.tab_content}>
          {tabFields &&
            tabFields.map(field => {
              var m = this.getFieldMarkers(field.name);
              var fieldProps = {
                ...this.props,
                ...field,
                key: field.name,
                markers: m,
                value: value && value[field.name],
                onChange: patchEvent =>
                  this.onFieldChangeHandler(field, patchEvent)
              };

              return <FormBuilderInput {...fieldProps} />;
            })}
        </div>
      </div>
    );
  };
}

export default withDocument(Tabs);
