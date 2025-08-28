import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2'
    );
  });

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="email-input" />);
    expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" data-testid="password-input" />);
    expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" data-testid="number-input" />);
    expect(screen.getByTestId('number-input')).toHaveAttribute('type', 'number');

    rerender(<Input type="search" data-testid="search-input" />);
    expect(screen.getByTestId('search-input')).toHaveAttribute('type', 'search');
  });

  it('handles placeholder text', () => {
    render(<Input placeholder="Enter your name" />);
    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test value');
  });

  it('handles controlled input', () => {
    const { rerender } = render(<Input value="initial" />);
    expect(screen.getByRole('textbox')).toHaveValue('initial');

    rerender(<Input value="updated" />);
    expect(screen.getByRole('textbox')).toHaveValue('updated');
  });

  it('handles user typing', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });

  it('forwards other props', () => {
    render(<Input data-testid="custom-input" maxLength={10} />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('handles required attribute', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByRole('textbox');

    input.focus();
    expect(handleFocus).toHaveBeenCalledTimes(1);

    input.blur();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    const handleKeyDown = jest.fn();
    render(<Input onKeyDown={handleKeyDown} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'Enter',
        code: 'Enter'
      })
    );
  });

  it('applies focus styles', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    input.focus();
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    );
  });

  it('handles file input type', () => {
    render(<Input type="file" />);
    // File inputs don't have a role, so we check by type
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('type', 'file');
  });

  it('maintains accessibility', () => {
    render(<Input aria-label="Search input" />);
    const input = screen.getByLabelText('Search input');
    expect(input).toBeInTheDocument();
  });

  it('handles form integration', () => {
    render(
      <form data-testid="test-form">
        <Input name="username" />
      </form>
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('name', 'username');
  });
});
