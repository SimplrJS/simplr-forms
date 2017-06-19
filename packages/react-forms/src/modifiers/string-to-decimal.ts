import { FieldValue } from "../contracts/field";
import { ValueOfType } from "../utils/value-helpers";
import { BaseModifier } from "./base-modifier";
import { ModifierValue } from "../contracts/value";

export interface StringToDecimalProps {
    delimiter?: string;
    precision?: number;
}

const EMPTY_VALUE = "";

export class StringToDecimalModifier extends BaseModifier<StringToDecimalProps, {}> {
    public static defaultProps: StringToDecimalProps = {
        delimiter: "."
    };

    private static emptyFormattedValue: string;

    public Format(value: FieldValue): FieldValue {
        if (value !== EMPTY_VALUE) {
            return value.toString();
        }
        return EMPTY_VALUE;
    }

    public Parse(modifierValue: ModifierValue): ModifierValue {
        let value = modifierValue.TransitionalValue != null ? modifierValue.TransitionalValue : modifierValue.Value;

        if (value.length === 0) {
            return {
                Value: 0,
                TransitionalValue: ""
            };
        }
        if (ValueOfType<string>(modifierValue, StringToDecimalModifier.name, "object")) {
            let negative = false;
            if (value.substr(0, 1) === "-") {
                negative = true;
                value = value.substr(1);

                // If there is only a minus sign
                if (value.length === 0) {
                    return {
                        Value: 0,
                        TransitionalValue: "-"
                    };
                }
            }

            // Non-undefined because of defaultProps
            const delimiter = this.props.delimiter!;

            const leadingMinus = negative ? "-" : "";
            const regex = new RegExp(`[^0-9\\${delimiter}]+`, "g");
            const extractedValue: string = this.LeaveOnlyFirstDelimiter(
                value.replace(regex, ""),
                delimiter);

            const firstCharWasZero = extractedValue.substr(0, 1) === "0";

            let transitionalValue = this.TrimLeft(extractedValue, "0");

            // Add leading zero, if fraction is being entered without leading zero
            const leadingZeroForFractionShortcut = transitionalValue.substr(0, 1) === this.props.delimiter;
            const leadingZeroForFraction = firstCharWasZero &&
                (transitionalValue.substr(1, 1) === this.props.delimiter || transitionalValue.length === 0);

            if (leadingZeroForFractionShortcut || leadingZeroForFraction) {
                transitionalValue = "0" + transitionalValue;
            }

            if (this.props.precision != null) {
                const delimiterIndex = transitionalValue.indexOf(delimiter);
                if (delimiterIndex !== -1) {
                    transitionalValue = transitionalValue.substr(0, delimiterIndex + this.props.precision + 1);
                }
            }

            transitionalValue = leadingMinus + transitionalValue;
            const numValue = Number(transitionalValue);

            return {
                Value: numValue,
                TransitionalValue: transitionalValue !== numValue.toString() ? transitionalValue : undefined
            };
        }
        return {
            Value: 0
        };
    }

    protected TrimLeft(value: string, symbol: string): string {
        const arr = Array.from(value);
        while (arr.length > 0 && arr[0] === symbol) {
            arr.splice(0, 1);
        }
        return arr.join("");
    }

    protected LeaveOnlyFirstDelimiter(value: string, delimiter: string): string {
        if (value.indexOf(delimiter) === -1) {
            return value;
        }

        const [start, ...rest] = value.split(delimiter);
        return start + delimiter + rest.join("");
    }
}