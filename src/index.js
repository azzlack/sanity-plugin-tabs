import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { withDocument } from "part:@sanity/form-builder";
import { FormBuilderInput } from "part:@sanity/form-builder";
import Button from "part:@sanity/components/buttons/default";

import styles from "./tabs.css";

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

  getActiveTabFields = () => {
    if (this.state.activeTab !== "") {
      return this.getTabFields(this.state.activeTab);
    }

    return null;
  };

  onFieldChangeHandler = (field, fieldPatchEvent) => {
    const { onChange, type } = this.props;
    var e = fieldPatchEvent.prefixAll(field.name);

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
                return (
                  <Button
                    className={styles.tab}
                    inverted={this.state.activeTab == fs.name ? false : true}
                    onClick={() => this.onTabClicked(fs)}
                  >
                    {fs.title}
                  </Button>
                );
              })}
            </div>
          )}
        <div className={styles.tab_content}>
          {tabFields &&
            tabFields.map(field => {
              var fieldProps = {
                type: field.type,
                value: value && value[field.name],
                onBlur: this.props.onBlur,
                onFocus: this.props.onFocus,
                onChange: patchEvent =>
                  this.onFieldChangeHandler(field, patchEvent)
              };

              return (
                <Fragment key={field.name}>
                  <FormBuilderInput {...fieldProps} isRoot={true} />
                </Fragment>
              );
            })}
        </div>
      </div>
    );
  };
}

export default withDocument(Tabs);
