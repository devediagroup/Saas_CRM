import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'strongPassword', async: false })
export class StrongPasswordValidator implements ValidatorConstraintInterface {
    validate(password: string, args: ValidationArguments) {
        if (!password) return false;

        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Password must be at least 8 characters long and contain uppercase letters, lowercase letters, numbers, and special characters (!@#$%^&*(),.?":{}|<>)';
    }
}

/**
 * Utility function to validate password strength
 * @param password - The password to validate
 * @returns Object with validation result and detailed feedback
 */
export function validatePasswordStrength(password: string) {
    const result = {
        isValid: true,
        errors: [] as string[],
        strength: 0,
    };

    if (!password) {
        result.isValid = false;
        result.errors.push('Password is required');
        return result;
    }

    // Check minimum length
    if (password.length < 8) {
        result.isValid = false;
        result.errors.push('Password must be at least 8 characters long');
    } else {
        result.strength += 20;
    }

    // Check for uppercase letters
    if (!/[A-Z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one uppercase letter');
    } else {
        result.strength += 20;
    }

    // Check for lowercase letters
    if (!/[a-z]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one lowercase letter');
    } else {
        result.strength += 20;
    }

    // Check for numbers
    if (!/\d/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one number');
    } else {
        result.strength += 20;
    }

    // Check for special characters
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        result.isValid = false;
        result.errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
    } else {
        result.strength += 20;
    }

    // Additional strength checks
    if (password.length >= 12) {
        result.strength += 10;
    }

    if (/[!@#$%^&*(),.?":{}|<>]{2,}/.test(password)) {
        result.strength += 5;
    }

    // Cap strength at 100
    result.strength = Math.min(result.strength, 100);

    return result;
}