// Copyright (C) 2020 Intel Corporation
//
// SPDX-License-Identifier: MIT

/// <reference types="cypress" />

import { labelName, taskName } from '../../support/const';

context('Lock/hide features.', () => {
    const caseId = '17';
    const newLabelName1 = `First label case ${caseId}`;
    const newLabelName2 = `Second label case ${caseId}`;
    const newLabelName3 = `Third label case ${caseId}`;
    const newLabelName4 = `Fourth label case ${caseId}`;
    let cvatObjectsSidebarStateItem1 = '';
    const createPolygonShape = {
        reDraw: false,
        type: 'Shape',
        switchLabel: false,
        pointsMap: [
            { x: 200, y: 200 },
            { x: 250, y: 200 },
            { x: 250, y: 250 },
        ],
        complete: true,
        numberOfPoints: null,
    };
    const createRectangleTrack2Points = {
        points: 'By 2 Points',
        type: 'Track',
        switchLabel: false,
        firstX: 260,
        firstY: 200,
        secondX: 360,
        secondY: 250
    };
    const createCuboidShape4Points = {
        points: 'By 4 Points',
        type: 'Shape',
        switchLabel: false,
        firstX: 400,
        firstY: 350,
        secondX: 500,
        secondY: 320,
        thirdX: 500,
        thirdY: 450,
        fourthX: 400,
        fourthY: 450,
    };
    const createPolylinesShapeSwitchLabel = {
        type: 'Shape',
        switchLabel: true,
        labelName: newLabelName1,
        pointsMap: [
            { x: 600, y: 200 },
            { x: 650, y: 200 },
            { x: 650, y: 250 },
        ],
        complete: true,
        numberOfPoints: null,
    };
    const createPointsShapeSwitchLabel = {
        type: 'Shape',
        switchLabel: true,
        labelName: newLabelName2,
        pointsMap: [
            { x: 700, y: 200 }
        ],
        complete: true,
        numberOfPoints: null,
    };
    const createRectangleShape4Points = {
        points: 'By 4 Points',
        type: 'Shape',
        switchLabel: true,
        labelName: newLabelName3,
        firstX: 550,
        firstY: 350,
        secondX: 650,
        secondY: 350,
        thirdX: 650,
        thirdY: 450,
        fourthX: 550,
        fourthY: 450,
    };
    const createPolygonTrack = {
        reDraw: false,
        type: 'Track',
        switchLabel: true,
        labelName: newLabelName4,
        pointsMap: [
            { x: 700, y: 350 },
            { x: 850, y: 350 },
            { x: 850, y: 450 },
            { x: 700, y: 450 },
        ],
        numberOfPoints: 4,
    };

    let shapeWidth = 0;

    before(() => {
        cy.openTask(taskName);
        cy.addNewLabel(newLabelName1);
        cy.addNewLabel(newLabelName2);
        cy.addNewLabel(newLabelName3);
        cy.addNewLabel(newLabelName4);
        cy.openJob();
    });

    describe(`Testing case "${caseId}"`, () => {
        it('Draw several objects (different shapes, tracks, tags, labels)', () => {
            cy.createPolygon(createPolygonShape);
            // Get css "background-color" for further comparison.
            cy.get('#cvat-objects-sidebar-state-item-1').then($cvatObjectsSidebarStateItem1 => {
                cvatObjectsSidebarStateItem1 = $cvatObjectsSidebarStateItem1.css('background-color');
            });
            cy.createRectangle(createRectangleTrack2Points);
            cy.createCuboid(createCuboidShape4Points);
            cy.createPolyline(createPolylinesShapeSwitchLabel);
            cy.createPoint(createPointsShapeSwitchLabel);
            cy.createRectangle(createRectangleShape4Points);
            cy.createPolygon(createPolygonTrack);
            cy.createTag(newLabelName4);
        });
        it('Lock all the objects with a dedicated button (in side bar header). All the objects are locked.', () => {
            cy.get('.cvat-objects-sidebar-states-header').within(() => {
                cy.get('i[aria-label="icon: unlock"]').click();
            });
            cy.get('.cvat-objects-sidebar-state-item').each(item => {
                cy.get(item).within(() => {
                    cy.get('.cvat-object-item-button-lock-enabled').should('exist');
                });
            });
        });
        it('Hide all the objects. Objects are still visible because they cannot be hidden while locked.', () => {
            cy.get('.cvat-objects-sidebar-states-header').within(() => {
                cy.get('i[aria-label="icon: eye-invisible"]').click();
            });
            cy.get('.cvat-objects-sidebar-state-item').each(item => {
                cy.get(item).within(() => {
                    cy.get('.cvat-object-item-button-hidden-enabled').should('not.exist');
                });
            });
            cy.get('.cvat_canvas_shape').each(item => {
                cy.get(item).should('be.visible');
            });
        });
        it('Unlock all objects and hide all objects. All the objects are hidden.', () => {
            cy.get('.cvat-objects-sidebar-states-header').within(() => {
                cy.get('i[aria-label="icon: lock"]').click();
                cy.get('i[aria-label="icon: eye"]').click();
            });
            cy.get('.cvat-objects-sidebar-state-item').each(item => {
                cy.get(item).invoke('text').then($itemText => {
                    // Sidebar for "Tag" doesn't have "Switch hidden property" button.
                    if (!$itemText.match(/\d+TAG/)) {
                        cy.get(item).within(() => {
                            cy.get('.cvat-object-item-button-hidden-enabled').should('exist');
                        });
                    }
                });
            });
            cy.get('.cvat_canvas_shape').each(item => {
                cy.get(item).should('have.class', 'cvat_canvas_hidden');
            });
        });
        it('Set properties occluded & pinned to true for a shape. Shape is occluded is visualized (dashed contour) and the shape cannot be moved, but can be resized.', () => {
            // Unhide rectangle shape.
            cy.get('#cvat-objects-sidebar-state-item-6').within(() => {
                cy.get('i[aria-label="icon: eye-invisible"]').click();
            });
            cy.get('#cvat_canvas_shape_6').should('be.visible');
            cy.get('#cvat-objects-sidebar-state-item-6').within(() => {
                cy.get('.cvat-object-item-button-occluded').click().should('have.class', 'cvat-object-item-button-occluded-enabled');
            });
            cy.get('#cvat_canvas_shape_6').should('have.css', 'stroke-dasharray');
            cy.get('#cvat-objects-sidebar-state-item-6').within(() => {
                cy.get('.cvat-object-item-button-pinned').click().should('have.class', 'cvat-object-item-button-pinned-enabled');
            });
            cy.get('#cvat_canvas_shape_6').should('not.have.class', 'cvat_canvas_shape_draggable');
            // Get cuttent values for "width" parameter.
            cy.get('#cvat_canvas_shape_6').should('have.attr', 'width').then($shapeWidth => {
                shapeWidth = $shapeWidth;
            });
            // Resize rectangle shape.
            cy.get('.cvat-canvas-container').trigger('mousedown', 650, 400, {button: 0}).trigger('mousemove', 660, 400).trigger('mouseup');
            cy.get('#cvat_canvas_shape_6').should('have.attr', 'width').then($shapeWidth => {
                expect(Math.floor(shapeWidth)).to.be.lessThan(Math.floor($shapeWidth)); // expected 95 to be below 104
            });
        });
        it('Go to polygon. Pinned is set to true by default. Set it to false. Polygon can be moved.', () => {
            cy.get('#cvat-objects-sidebar-state-item-1').within(() => {
                cy.get('.cvat-object-item-button-pinned-enabled').should('exist');
            });
            cy.get('#cvat_canvas_shape_1').should('not.have.class', 'cvat_canvas_shape_draggable');
            cy.get('#cvat-objects-sidebar-state-item-1').within(() => {
                cy.get('.cvat-object-item-button-pinned').click().should('not.have.class', 'cvat-object-item-button-pinned-enabled');
                // Unhide polygon shape.
                cy.get('.cvat-object-item-button-hidden').click().should('not.have.class', 'cvat-object-item-button-hidden-enabled');
            });
            cy.get('#cvat_canvas_shape_1').should('have.class', 'cvat_canvas_shape_draggable');
        });
        it('Go to "Labels" tab.', () => {
            // Hide and unhide all objects for convenience of next testing.
            cy.get('.cvat-objects-sidebar-states-header').within(() => {
                cy.get('i[aria-label="icon: eye"]').click();
                cy.get('i[aria-label="icon: eye-invisible"]').click();
            });
            cy.get('.cvat-objects-sidebar').within(() => {
                cy.contains('Labels').click();
            });
        });
        it('Repeat hide/lock for one of the labels. Objects with other labels weren’t affected.', () => {
            const objectsSameLabel = ['cvat_canvas_shape_1', 'cvat_canvas_shape_2', 'cvat_canvas_shape_3'];
            cy.get('.cvat-objects-sidebar-labels-list').within(() => {
                // Hide and lock all object with "Main task" label (#cvat_canvas_shape_1-3).
                cy.contains(labelName).parents('.cvat-objects-sidebar-label-item').within(() => {
                    cy.get('.cvat-label-item-button-hidden').click().should('have.class', 'cvat-label-item-button-hidden-enabled');
                    cy.get('.cvat-label-item-button-lock').click().should('have.class', 'cvat-label-item-button-lock-enabled');
                });
            });
            cy.get('.cvat_canvas_shape').then(objectList => {
                for (let i=0; i<objectList.length; i++) {
                    // Checking whether the class exists on all objects except for objects with the "Main task" label.
                    if (!objectsSameLabel.includes(objectList[i].id)) {
                        cy.get(objectList[i]).should('not.have.class', 'cvat_canvas_hidden');
                    }
                }
            });
            // Go to "Object" tab to check whether objects can change their labels.
            cy.get('.cvat-objects-sidebar').within(() => {
                cy.contains('Objects').click();
            });
            // Objects that have a label different from the "Main task" should not be blocked.
            cy.get('.cvat-objects-sidebar-state-item').then(objectSidebarList => {
                for (let i=0; i<objectSidebarList.length; i++) {
                    if (!objectSidebarList[i].textContent.match(new RegExp(`${labelName}`, 'g'))) {
                        cy.get(objectSidebarList[i]).within(() => {
                            cy.get('.ant-select-selection-selected-value').click({force: true});
                        });
                        cy.get('.ant-select-dropdown-menu').last().contains(labelName).click({force: true});
                        // Checking that the css parameter "background-color" has become the same as the ".cvat-objects-sidebar-state-item" with "Main task" label.
                        cy.get(objectSidebarList[i]).should('have.css', 'background-color', cvatObjectsSidebarStateItem1);
                    }
                }
            });
        });
    });
});
