import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  withDocument,
  FormBuilderInput,
  patches,
} from 'part:@sanity/form-builder';
import { log, resolveTypeName } from './utils';
import InvalidValue from '@sanity/form-builder/lib/inputs/InvalidValueInput';
import * as PathUtils from '@sanity/util/paths.js';
import ErrorOutlineIcon from 'part:@sanity/base/error-outline-icon';
import WarningOutlineIcon from 'part:@sanity/base/warning-outline-icon';
import defaultStyles from 'part:@sanity/components/formfields/default-style';
import classNames from 'classnames';
import styles from './tabs.css';

const { setIfMissing } = patches;

class Tabs extends React.Component {
  static propTypes = {
    type: PropTypes.shape({
      fieldsets: PropTypes.array.isRequired,
      fields: PropTypes.array.isRequired,
    }).isRequired,
    level: PropTypes.number,
    value: PropTypes.shape({
      _type: PropTypes.string,
    }),
    focusPath: PropTypes.array,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
  };

  firstFieldInput = React.createRef();
  activeTabPanel = React.createRef();

  state = {
    activeTab: '',
  };

  focus = () => {
    if (this.firstFieldInput.current) {
      this.firstFieldInput.current.focus();
    } else {
    }

    log(`[Tabs] Focus`);
  };

  getTabFields = (tabName) => {
    return this.props.type.fields.filter(
      (f) => f.fieldset == tabName && f.type.hidden !== true
    );
  };

  flattenFields = (arr) => {
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
    return PathUtils.startsWith(path, childPath)
      ? PathUtils.trimLeft(path, childPath)
      : [];
  };

  getFieldSet = (path) => {
    if (path && path.length > 0) {
      var f = this.props.type.fields.find((f) => {
        return path.findIndex(f.name) > -1;
      });

      return f.fieldset;
    }
  };

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
  };

  getFieldMarkers = (fieldName) => {
    return this.props.markers.filter((marker) =>
      PathUtils.startsWith([fieldName], marker.path)
    );
  };

  getActiveTabFields = () => {
    if (this.state.activeTab !== '') {
      return this.getTabFields(this.state.activeTab);
    }

    return null;
  };

  onFieldBlurHandler = (field) => {
    const { onBlur, type } = this.props;

    log(`[Tabs] FieldBlurred:`, field);

    if (onBlur) {
      onBlur();
    }
  };

  onFieldFocusHandler = (field, path) => {
    const { onFocus, type } = this.props;

    log(`[Tabs] FieldFocused:`, field, path);

    if (onFocus) {
      onFocus(path);
    }
  };

  onFieldChangeHandler = (field, fieldPatchEvent) => {
    const { onChange, type } = this.props;

    if (!field.type.readOnly) {
      var e = fieldPatchEvent
        .prefixAll(field.name)
        .prepend(setIfMissing({ _type: type.name }));

      log(`[Tabs] FieldChanged:`, field, e);

      if (onChange) {
        onChange(e);
      }
    }
  };

  onHandleInvalidValue = (field, fieldPatchEvent) => {
    const { onChange, type } = this.props;
  };

  onTabClicked = (fieldset) => {
    this.setState({
      activeTab: fieldset.name,
    });
    this.activeTabPanel.current.focus();
  };

  setInput = (input) => {
    this.firstFieldInput = input;
  };

  componentDidMount() {
    if (this.state.activeTab === '' && this.props.type.fieldsets.length > 0) {
      this.setState({
        activeTab: this.props.type.fieldsets[0].name,
      });
    }
  }

  render = () => {
    log(`[Tabs] Props:`, this.props);

    const {
      level,
      readOnly,
      focusPath,
      value,
      type,
      ...otherProps
    } = this.props;
    const tabFields = this.getActiveTabFields();

    let contentStyle = styles.content_document;

    if (type.options.layout === 'object') {
      contentStyle = styles.content_object;
    }

    var fieldSets = [];
    if (
      type.fieldsets &&
      type.fieldsets[0].single !== true
    ) {
      fieldSets = type.fieldsets.filter((fs) => 
        (fs.fields ?? [fs.field]).some((field) => field.type.hidden !== true)
      ).sort((a, b) => {
        if (a.options && b.options) {
          return a.options.sortOrder - b.options.sortOrder;
        }

        return 0;
      });
    }

    return (
      <div className={styles.tabs}>
        {fieldSets.length > 1 && (
          <div className={styles.tab_headers}>
            {fieldSets.map((fs) => {
              var markers = this.getTabMarkers(fs.name);
              var validation = markers.filter(
                (marker) => marker.type === 'validation'
              );
              var errors = validation.filter(
                (marker) => marker.level === 'error'
              );
              var warnings = validation.filter(
                (marker) => marker.level === 'warning'
              );
              var hasErrors = errors.length > 0;
              var hasWarnings = warnings.length > 0;
              var hasIcon = hasErrors || hasWarnings;
              var title = fs.title || 'Other';

              const iconStyles = classNames(
                styles.icon,
                hasErrors && styles.icon__error,
                !hasErrors && hasWarnings && styles.icon__warning
              );

              return (
                <button
                  key={fs.name || 'other'}
                  className={classNames(styles.tab, {
                    [styles.tab__active]: this.state.activeTab == fs.name,
                  })}
                  onClick={() => this.onTabClicked(fs)}
                  role="tab"
                  aria-selected={this.state.activeTab == fs.name}
                  aria-controls={`${fs.name}-tab-panel`}
                  id={`${fs.name}-tab`}
                >
                  <div className={styles.tab_inner}>
                    {title}
                    {hasIcon && (
                      <span className={iconStyles}>
                        {hasErrors && <ErrorOutlineIcon />}
                        {!hasErrors && hasWarnings && <WarningOutlineIcon />}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div
          className={contentStyle}
          tabIndex={0}
          role="tabpanel"
          id={`${this.state.activeTab}-tab-panel`}
          aria-labelledby={`${this.state.activeTab}-tab`}
          ref={this.activeTabPanel}
        >
          {tabFields &&
            tabFields.map((field, i) => {
              var fieldLevel = level;
              var fieldRef = i === 0 ? this.firstFieldInput : null;
              var fieldMarkers = this.getFieldMarkers(field.name);
              var fieldPath = [field.name];
              var fieldType = field.type;
              var fieldReadOnly = field.type.readOnly || readOnly;
              var fieldValue =
                value && value[field.name] ? value[field.name] : undefined;

              var fieldWrapperProps = {
                key: field.name,
                className: classNames(defaultStyles.root, styles.field_wrapper),
              };

              var fieldProps = {
                ...otherProps,
                ref: fieldRef,
                type: fieldType,
                markers: fieldMarkers,
                level: fieldLevel,
                path: fieldPath,
                focusPath: focusPath,
                readOnly: fieldReadOnly,
                value: fieldValue,
                isRoot: false,
                onFocus: (path) => this.onFieldFocusHandler(field, path),
                onChange: (patchEvent) =>
                  this.onFieldChangeHandler(field, patchEvent),
                onBlur: () => this.onFieldBlurHandler(field),
              };

              // Handle invalid values.
              // Lifted from https://github.com/sanity-io/sanity/blob/next/packages/@sanity/form-builder/src/inputs/ObjectInput/Field.tsx
              if (typeof fieldValue !== 'undefined') {
                const expectedType = fieldType.name;
                const actualType = resolveTypeName(fieldValue);
                const isCompatible = actualType === fieldType.jsonType;

                if (expectedType !== actualType && !isCompatible) {
                  return (
                    <div {...fieldWrapperProps}>
                      <InvalidValue
                        value={fieldValue}
                        onChange={fieldProps.onChange}
                        validTypes={[fieldType.name]}
                        actualType={actualType}
                        ref={this.setInput}
                      />
                    </div>
                  );
                }
              }

              return (
                <div {...fieldWrapperProps}>
                  <FormBuilderInput {...fieldProps} />
                </div>
              );
            })}
        </div>
      </div>
    );
  };
}

export default withDocument(Tabs);
