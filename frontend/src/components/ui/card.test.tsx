import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('renders with default props', () => {
      render(<Card>Card Content</Card>);
      const card = screen.getByText('Card Content');
      expect(card).toBeInTheDocument();
      expect(card.closest('div')).toHaveClass('rounded-lg', 'border', 'bg-card', 'shadow-sm');
    });

    it('applies custom className', () => {
      render(<Card className="custom-class">Content</Card>);
      expect(screen.getByText('Content').closest('div')).toHaveClass('custom-class');
    });

    it('forwards other props', () => {
      render(<Card data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('renders with default styling', () => {
      render(
        <CardHeader data-testid="card-header">
          <div>Header Content</div>
        </CardHeader>
      );
      const header = screen.getByTestId('card-header');
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    it('applies custom className', () => {
      render(
        <CardHeader className="custom-header" data-testid="card-header">
          <div>Content</div>
        </CardHeader>
      );
      expect(screen.getByTestId('card-header')).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('renders as h3 with correct styling', () => {
      render(<CardTitle>Title Text</CardTitle>);
      const title = screen.getByRole('heading', { level: 3 });
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight');
      expect(title).toHaveTextContent('Title Text');
    });

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      expect(screen.getByRole('heading', { level: 3 })).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('renders with correct styling', () => {
      render(<CardDescription>Description Text</CardDescription>);
      const description = screen.getByText('Description Text');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>);
      expect(screen.getByText('Description')).toHaveClass('custom-desc');
    });
  });

  describe('CardContent', () => {
    it('renders with correct styling', () => {
      render(<CardContent>Content Text</CardContent>);
      const content = screen.getByText('Content Text').closest('div');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('applies custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>);
      expect(screen.getByText('Content').closest('div')).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('renders with correct styling', () => {
      render(<CardFooter>Footer Content</CardFooter>);
      const footer = screen.getByText('Footer Content').closest('div');
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>);
      expect(screen.getByText('Footer').closest('div')).toHaveClass('custom-footer');
    });
  });

  describe('Complete Card Composition', () => {
    it('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title');
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveTextContent('Action Button');
    });

    it('maintains proper structure and accessibility', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Main Title</CardTitle>
            <CardDescription>Brief description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      );

      // Check semantic structure
      const card = screen.getByText('Card content').closest('.rounded-lg');
      expect(card).toBeInTheDocument();

      // Check heading hierarchy
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Main Title');
    });
  });
});
