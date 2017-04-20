import { FieldValue } from "../contracts/field";

export class StateUpdated { }

export class FieldRegistered {
    constructor(private fieldId: string, private initialValue: FieldValue) { }

    public get FieldId() {
        return this.fieldId;
    }

    public get InitialValue() {
        return this.initialValue;
    }
}

export class ValueChanged {
    constructor(private fieldId: string, private newValue: FieldValue) { }

    public get FieldId() {
        return this.fieldId;
    }

    public get NewValue() {
        return this.newValue;
    }
}

export class PropsChanged {
    constructor(private fieldId: string) { }

    public get FieldId() {
        return this.fieldId;
    }
}
