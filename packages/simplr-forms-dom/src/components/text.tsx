import * as React from "react";
import { FieldValue } from "simplr-forms/contracts";
import { DomFieldProps } from "../contracts/field";

import {
    BaseDomField,
    BaseDomFieldState
} from "../abstractions/base-dom-field";
import {
    FieldOnChangeCallback,
    FieldOnChangeInternalCallback
} from "../contracts/field";

export type TextOnChangeCallback = FieldOnChangeCallback<HTMLInputElement>;

/**
 * Override the differences between extended interfaces.
 */
export interface TextProps extends DomFieldProps, React.HTMLProps<HTMLInputElement> {
    name: string;
    onFocus?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
    onBlur?: React.EventHandler<React.FocusEvent<HTMLInputElement>>;
    onChange?: TextOnChangeCallback & FieldOnChangeInternalCallback;
    ref?: any;

    defaultValue?: FieldValue;
    value?: FieldValue;
}

export class Text extends BaseDomField<TextProps, BaseDomFieldState> {
    protected GetValueFromEvent(event: React.FormEvent<HTMLInputElement>): FieldValue {
        return event.currentTarget.value;
    }

    protected OnChangeHandler: React.FormEventHandler<HTMLInputElement> = (event) => {
        let newValue: string | undefined;
        if (!this.IsControlled) {
            this.OnValueChange(this.GetValueFromEvent(event));
            newValue = this.FormStore.GetField(this.FieldId).Value;
        } else {
            newValue = this.GetValueFromEvent(event);
        }

        if (this.props.onChange != null) {
            this.props.onChange(event, newValue, this.FieldId, this.FormId);
        }

        // TODO: FormProps.OnFieldChange
    }

    protected get RawDefaultValue() {
        if (this.props.defaultValue != null) {
            return this.props.defaultValue;
        }
        return "";
    }

    renderField(): JSX.Element | null {
        return <input
            type="text"
            name={this.FieldId}
            value={this.Value}
            onChange={this.OnChangeHandler}
            disabled={this.Disabled}
            onFocus={this.OnFocus}
            onBlur={this.OnBlur}
        />;
    }
}
