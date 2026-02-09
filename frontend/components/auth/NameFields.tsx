import { FormField } from './FormField';

interface NameFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export function NameFields({ firstName, lastName, onFirstNameChange, onLastNameChange }: NameFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField label="First Name" required>
        <input
          type="text"
          value={firstName}
          onChange={(e) => onFirstNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="Jane"
        />
      </FormField>
      <FormField label="Last Name" required>
        <input
          type="text"
          value={lastName}
          onChange={(e) => onLastNameChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          placeholder="Doe"
        />
      </FormField>
    </div>
  );
}
