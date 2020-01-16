import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {withDocument} from 'part:@sanity/form-builder'
import {FormBuilderInput, patches} from 'part:@sanity/form-builder'

import styles from './tabs.css';

const {setIfMissing} = patches;

class Tabs extends React.Component {
  focusRef = React.createRef();

  static propTypes = {
    type: PropTypes.shape({
        fieldsets: PropTypes.array.isRequired,
        fields: PropTypes.array.isRequired,
        // type: PropTypes.shape({
        //     name: PropTypes.oneOf(['object']).isRequired
        // })
    }).isRequired,
    value: PropTypes.object,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func.isRequired
  }

  state = {
    activeTab: ""
  };

  focus = () => {
    if (this.focusRef.current && this.focusRef.current.focus) {
        this.focusRef.current.focus()
    }
  }

  getTabFields = (tabName) => {
    return this.props.type.fields.filter(f => f.fieldset == tabName);
  }

  getActiveTabFields = () => {
      if (this.state.activeTab !== "") {
        return this.getTabFields(this.state.activeTab);
      }

      return null;
  }

  onFieldChangeHandler = (field, fieldPatchEvent) => {
    const {onChange, type} = this.props;
    var e = fieldPatchEvent
                .prefixAll(field.name);

    console.debug(`[Tabs] FieldChanged:`, field, e);

    onChange(e);
  }

  onTabClicked = (fieldset) => {
      this.setState({
          activeTab: fieldset.name
      });
  }

  componentDidMount() {
      if (this.state.activeTab === "" && this.props.type.fieldsets.length > 0) {
          this.setState({
              activeTab: this.props.type.fieldsets[0].name
          });
      }
  }

  render = () => {
    console.debug(`[Tabs] Props:`, this.props);

    const {type, value} = this.props;
    const tabFields = this.getActiveTabFields();
    
    return (
        <div className={styles.tabs}>
            { type.fieldsets && type.fieldsets.length > 0 && type.fieldsets[0].single !== true && 
            <div className={styles.tab_headers}>
                {type.fieldsets.map(fs => {
                    return <div 
                        key={fs.name} 
                        className={this.state.activeTab == fs.name ? styles.tab_header__active : styles.tab_header} 
                        onClick={() => this.onTabClicked(fs)}>
                        {fs.title}
                    </div>;
                })}
            </div>
            }
            <div className={styles.tab_content}>
                {tabFields && tabFields.map(field => {
                    var fieldProps = {
                        type: field.type,
                        value: value && value[field.name],
                        onBlur: this.props.onBlur,
                        onFocus: this.props.onFocus,
                        onChange: (patchEvent) => this.onFieldChangeHandler(field, patchEvent)
                    }

                    return <Fragment key={field.name}>
                        <FormBuilderInput {...fieldProps} />
                    </Fragment>
                })}
            </div>
        </div>
    )
  }
}

export default withDocument(Tabs)