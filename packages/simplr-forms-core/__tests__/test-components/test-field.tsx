import * as React from "react";

import { BaseField, BaseFieldState } from "../../src/abstractions/base-field";
import { FieldProps, FieldValue } from "../../src/contracts/field";

export interface MyFieldProps extends FieldProps {
    value?: string;
    defaultValue?: string;
    randomKey?: string;
}

export interface MyFieldState extends BaseFieldState { }

export class MyTestField extends BaseField<MyFieldProps, MyFieldState> {
    render() {
        return <input type="text" onChange={this.onChange} value={this.state.Value} />;
    }

    onChange: React.FormEventHandler<HTMLInputElement> = (event) => {
        const target = event.target as EventTarget & HTMLInputElement;
        this.OnValueChange(target.value);
    }

    protected get RawInitialValue(): FieldValue {
        return "";
    }

    protected get DefaultValue(): FieldValue {
        return "";
    }
}