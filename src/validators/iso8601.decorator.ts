import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

function isValidISO8601(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
  return iso8601Regex.test(dateString);
}

export function IsValidISO8601(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isISO8601',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return isValidISO8601(value)
        },
        defaultMessage(_: ValidationArguments) {
          return 'A data informada não está no formato ISO 8601.';
        },
      },
    });
  };
}

