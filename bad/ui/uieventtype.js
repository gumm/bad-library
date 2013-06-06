// Copyright 2011 Trinity Telecomms (Pty) Ltd. All Rights Reserved.
/**
 * @fileoverview Panel Event Types.
 *
 */
goog.provide('bad.ui.EventType');
goog.provide('bad.ui.Resizable.EventType');

goog.require('goog.fx.Dragger.EventType');

/**
 * @enum {string}
 */
bad.ui.Resizable.EventType = {
    RESIZE: 'resize',
    START_RESIZE: 'start_resize',
    END_RESIZE: 'end_resize'
};


/**
 * Constants for panel event.
 * @enum {string}
 */
//noinspection JSUnusedGlobalSymbols
bad.ui.EventType = {
    /**
     * Dispatched after the content from the template is in the DOM
     * and the in-line scripts from the AJAX call has been eval'd.
     */
    PANEL_ACTION: 'panel_action',
    PANEL_READY: 'panel_ready',
    PANEL_DISPOSE: 'panel_dispose',
    PANEL_RECEIVED_TEMPLATE_DATA: 'panel_received_template_data',
    CHILD_DISPOSED: 'child_disposed',
    PANEL_PARENT_CHANGE: 'panel_parent_change',
    PANEL_SIZE_CHANGE: bad.ui.Resizable.EventType.END_RESIZE,
    PANEL_POSITION_CHANGE: goog.fx.Dragger.EventType.END,
    PANEL_MINIMIZE: 'panel_minimize',
    PANEL_SCHEDULE_ACCESS: 'panel_schedule_access'
};
