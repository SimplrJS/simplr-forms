import * as Immutable from "immutable";
import { recordify } from "typed-immutable-record";


import * as Actions from "./form-store-actions";

import { ActionEmitter } from "action-emitter";

import { FieldState, FieldValueType, FieldStateRecord } from "../contracts/field";
import { FormState, FormStateRecord } from "../contracts/form";
import { FormStoreState, FormStoreStateRecord } from "../contracts/form-store";
import { FieldGroupStateRecord } from "../contracts/field-group";

export class FormStore extends ActionEmitter {
    constructor(formId: string) {
        super();
        this.FormId = formId;
        this.state = this.GetInitialFormStoreState();
    }

    protected FormId: string;

    private state: FormStoreStateRecord;
    protected get State(): FormStoreStateRecord {
        return this.state;
    }
    protected set State(newState: FormStoreStateRecord) {
        this.state = newState;

        this.emit(new Actions.StateUpdated());
    }

    /**
     * ========================
     *  Public API
     * ========================
     */

    /**
     * Constructs field id from given fieldName and an optional fieldsGroupIdkds
     *
     * @param {string} fieldName
     * @param {string} [fieldsGroupId]
     * @returns Constructed field id
     *
     * @memberOf FormStore
     */
    public GetFieldId(fieldName: string, fieldsGroupId?: string) {
        if (fieldsGroupId != null) {
            return `${fieldsGroupId}___${fieldName}`;
        }

        return fieldName;
    }

    public RegisterField(fieldId: string, initialValue: FieldValueType, fieldsGroupId?: string) {
        // Construct field state
        let fieldState = this.GetInitialFieldState();
        fieldState.InitialValue = initialValue;
        fieldState.Value = initialValue;
        if (fieldsGroupId != null) {
            fieldState.FieldsGroup = {
                Id: fieldsGroupId
            };
        }

        // Add field into form store state
        this.State = this.State.withMutations(state => {
            state.Fields = state.Fields.set(fieldId, recordify<FieldState, FieldStateRecord>(fieldState));
        });
    }

    public UnregisterField(fieldId: string) {
        // Remove field from form store state
        this.State.Fields = this.State.Fields.remove(fieldId);
    }

    public HasField(fieldId: string): boolean {
        return this.State.Fields.has(fieldId);
    }



    /**
     * ========================
     *  Local helper methods
     * ========================
     */

    protected GetInitialFormStoreState(): FormStoreStateRecord {
        return recordify<FormStoreState, FormStoreStateRecord>({
            Fields: Immutable.Map<string, FieldStateRecord>(),
            FieldsGroups: Immutable.Map<string, FieldGroupStateRecord>(),
            Form: recordify<FormState, FormStateRecord>(this.GetInitialFormState())
        });
    }

    protected GetInitialFormState(): FormState {
        return {
            Submitting: false,
            SuccessfullySubmitted: false,
            ActiveFieldId: undefined,
            Error: undefined,
            SubmitCallback: undefined
        };
    }

    protected GetInitialFieldState(): FieldState {
        return {
            InitialValue: undefined,
            Value: undefined,
            Touched: false,
            Pristine: true,
            Validating: false,
            Error: undefined,
            FieldsGroup: undefined,
            Validators: undefined
        };
    }
}
