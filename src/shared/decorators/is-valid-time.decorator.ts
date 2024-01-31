import { ValidationOptions, registerDecorator } from "class-validator";

export function IsValidTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isTimeFormat",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== "string") {
            return false;
          }

          // Regular expression to match the "hh:mm AM/PM" format
          const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/i;
          return timeRegex.test(value);
        },
        defaultMessage() {
          return `${propertyName} should be in the format 'hh:mm AM/PM'`;
        }
      }
    });
  };
}
