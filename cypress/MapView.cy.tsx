import React from 'react';
import App from '../src/App';

describe('MapView', () => {
  it('shows "zoom in" after clicking - three times', () => {
    cy.mount(<App />);

    cy.contains('button', 'Close tutorial').click();

    cy.get('.leaflet-container').click().focus();
    for (let i = 0; i < 5; i++) {
      cy.get('.leaflet-tile-container img.leaflet-tile')
        .should('have.length.greaterThan', 0)
        .each(($tile) => {
          cy.wrap($tile).should('have.prop', 'complete', true);
        });

      cy.get('body').type('-');
    }

    cy.contains('Zoom in to see').should('be.visible');
  });
});
