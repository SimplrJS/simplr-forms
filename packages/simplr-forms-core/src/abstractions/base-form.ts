import * as React from "react";
import * as FormContracts from "../contracts/form";
import { FormStoresHandler } from "../stores/form-stores-handler";

export abstract class BaseForm<TProps extends FormContracts.FormProps, TState> extends React.Component<TProps, TState> {
    protected FormId: string;

    static childContextTypes = {
        FormId: React.PropTypes.string.isRequired
    };

    static defaultProps: FormContracts.FormProps = {
        destroyOnUnmount: true
    };

    constructor(props: FormContracts.FormProps) {
        super();
        this.registerForm(props);
    }

    getChildContext(): FormContracts.FormChildContext {
        return {
            FormId: this.FormId,
        };
    }

    componentWillUnmount() {
        if (this.props.destroyOnUnmount) {
            FormStoresHandler.UnregisterForm(this.FormId);
        }
    }

    abstract render(): JSX.Element | null;

    /*
     * Local helpers
     */
    private registerForm(props: FormContracts.FormProps) {
        let shouldNotDestroy = !props.destroyOnUnmount;

        if (props.formId == null) {
            if (shouldNotDestroy) {
                throw new Error("simplr-forms-core: destroyOnUnmount cannot be truthy when formId is not set.");
            } else {
                // props.formId is undefined, therefore this.FormId is generated by registering the form
                this.FormId = FormStoresHandler.RegisterForm(undefined, props.formStore);
            }
        } else {
            if (shouldNotDestroy) {
                // props.formId is given AND shouldNotDestroy AND form hasn't yet been registered
                if (FormStoresHandler.Exists(props.formId)) {
                    // The form has already been registered and we can use the given id
                    this.FormId = props.formId;
                } else {
                    // Register the form and use the generated formId
                    this.FormId = FormStoresHandler.RegisterForm(props.formId, props.formStore);
                }
            } else {
                // props.formId is given AND form should be destroyed
                this.FormId = FormStoresHandler.RegisterForm(props.formId, props.formStore);
            }
        }
    }
}
