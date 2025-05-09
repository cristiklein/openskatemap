import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import Welcome from './Welcome';

describe('Welcome', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the welcome overlay in the beginning', () => {
    render(<Welcome />);
    expect(screen.getByText('Welcome to Open Skate Map!')).toBeInTheDocument();
  });

  it('hides and shows the overlay based on user interaction', async () => {
    const user = userEvent.setup();
    render(<Welcome />);
    await user.click(screen.getByText('Close tutorial'));

    expect(screen.queryByText('Welcome to Open Skate Map!')).not.toBeInTheDocument();

    await user.click(screen.getByText('?'));

    expect(screen.queryByText('Welcome to Open Skate Map!')).toBeInTheDocument();
  });
});
