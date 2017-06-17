import * as React from "react";
import * as PropTypes from "prop-types";

import * as FormContracts from "../contracts/form";
import { FieldValidationType } from "../contracts/validation";
import { FormStore } from "../stores/form-store";
import { FSHContainer, FormStoresHandler } from "../stores/form-stores-handler";

export abstract class BaseForm<TProps extends FormContracts.FormProps, TState> extends React.Component<TProps, TState> {
    protected FormId: string;

    static childContextTypes = {
        FormId: PropTypes.string.isRequired
    };

    getChildContext(): FormContracts.FormChildContext {
        return {
            FormId: this.FormId,
        };
    }

    static defaultProps: FormContracts.FormProps = {
        destroyOnUnmount: true,
        fieldsValidationType: FieldValidationType.OnFieldRegistered |
        FieldValidationType.OnValueChange |
        FieldValidationType.OnPropsChange,
        disabled: false
    };

    constructor(props: FormContracts.FormProps) {
        super();
        this.registerForm(props);
        this.FormStore.UpdateFormProps(props);
    }

    protected get FormStoresHandler(): FormStoresHandler {
        return FSHContainer.FormStoresHandler;
    }

    protected get FormStore(): FormStore {
        return this.FormStoresHandler.GetStore(this.FormId);
    }

    protected ShouldFormSubmit() {
        if (this.props.forceSubmit === true) {
            return true;
        }
        return this.FormStore.GetState().Form.Error == null;
    }

    componentWillUnmount() {
        if (this.props.destroyOnUnmount) {
            this.FormStoresHandler.UnregisterForm(this.FormId);
        }
    }

    abstract render(): JSX.Element | null;

    /*
     * Local helpers
     */
    private registerForm(props: FormContracts.FormProps): void {
        if (props.formId == null) {
            if (!props.destroyOnUnmount) {
                throw new Error("simplr-forms: destroyOnUnmount cannot be falsy when formId is not set.");
            } else {
                // props.formId is undefined, therefore this.FormId is generated by registering the form
                this.FormId = this.FormStoresHandler.RegisterForm(undefined, props.formStore);
            }
        } else {
            if (!props.destroyOnUnmount) {
                // props.formId is given AND shouldNotDestroy AND form hasn't yet been registered
                if (this.FormStoresHandler.Exists(props.formId)) {
                    // The form has already been registered and we can use the given id
                    this.FormId = props.formId;
                } else {
                    // Register the form and use the generated formId
                    this.FormId = this.FormStoresHandler.RegisterForm(props.formId, props.formStore);
                }
            } else {
                // props.formId is given AND form should be destroyed
                this.FormId = this.FormStoresHandler.RegisterForm(props.formId, props.formStore);
            }
        }
    }
}
