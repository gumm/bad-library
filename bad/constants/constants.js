goog.provide('bad.CssClassMap');
goog.provide('bad.CssPrefix');

bad.CssPrefix = {
    TEMPLATE: 'tcc',
    UI: 'badlib-ui',
    GADGET: 'badlib-gdt',
    GRAPH: 'badlib-graph',
    LAYOUT: 'layout',
    ICON: 'icon'
};

/**
 * An enumerator to the HTML element class names.
 * @enum {string}
 */
//noinspection JSUnusedGlobalSymbols
bad.CssClassMap = {
    PANEL_HEADER: goog.getCssName(bad.CssPrefix.UI,
        'panel_header'),
    PANEL_HEADER_LABEL: goog.getCssName(bad.CssPrefix.UI,
        'panel_header_label'),
    PANEL_HEADER_SUB_HEAD: goog.getCssName(bad.CssPrefix.UI,
        'panel_header_sub'),
    PANEL_TOOLBAR_HEADER: goog.getCssName(bad.CssPrefix.UI,
        'panel_toolbar_header'),
    PANEL_TOOLBOX: goog.getCssName(bad.CssPrefix.UI,
        'panel_toolbox'),
    PANEL_TOOLBOX_LEFT: goog.getCssName(bad.CssPrefix.UI,
        'panel_toolbox_left'),
    PANEL_TOOLBOX_RIGHT: goog.getCssName(bad.CssPrefix.UI,
        'panel_toolbox_right'),
    PANEL_MAIN: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'panel_main'),
    PANEL_THIN_CENTER: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'panel_thin-center'),
    PANEL_CONTENT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'panel_content'),
    PANEL_HELP: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'panel_help'),
    PANEL_WRAPPER: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'panel_wrapper'),
    PANEL_HELP_CONTENT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'help_content'),
    FLOATING: goog.getCssName(bad.CssPrefix.UI,
        'floating'),
    MODAL_LIKE: goog.getCssName(bad.CssPrefix.UI,
        'modal_like'),
    DRAGGING: goog.getCssName(bad.CssPrefix.UI,
        'dragging'),
    DRAGGABLE: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'cursor_grabbable'),
    PANEL_HEADING: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'panel_heading'),
    REFRESH_COUNTDOWN: goog.getCssName(bad.CssPrefix.UI,
        'refresh_countdown'),
    SORTED: goog.getCssName(bad.CssPrefix.UI,
        'th_sorted'),
    SORTABLE: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sortable'),
    SEARCHABLE: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'searchable'),
    CHOICEABLE: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'choiceable'),
    REVERSED: goog.getCssName(bad.CssPrefix.UI,
        'th_sorted_reversed'),
    FILTERED: goog.getCssName(bad.CssPrefix.UI,
        'filtered'),
    DATA_TABLE_SPACER: goog.getCssName(bad.CssPrefix.UI,
        'data_table_th_spacer'),
    DATA_TABLE_TOOLBAR: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'data_table_toolbar'),
    DATA_TABLE_TOOLBAR_INNER: goog.getCssName(bad.CssPrefix.UI,
        'data_table_toolbar_inner'),
    DATA_TABLE_LEFT_INDICATOR: goog.getCssName(bad.CssPrefix.UI,
        'datatable-indicator-left'),
    DATA_TABLE_RIGHT_INDICATOR: goog.getCssName(bad.CssPrefix.UI,
        'datatable-indicator-right'),
    DATA_TABLE_HEAD_INNER_TEXT: goog.getCssName(bad.CssPrefix.UI,
        'data_table_th_inner_text'),
    DATA_TABLE_FOOTER: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'table_footer'),
    DATA_TABLE_PAGINATION: goog.getCssName(bad.CssPrefix.UI,
        'data_table_pagination'),
    DATA_TABLE_PAGINATION_READOUT: goog.getCssName(bad.CssPrefix.UI,
        'data_table_pagination_readout'),
    PAGINATION_BUTTON: goog.getCssName(bad.CssPrefix.UI,
        'button-pagination'),
    CHECK_BOX: goog.getCssName(bad.CssPrefix.UI,
        'checkbox'),
    MULTI_SELECT: goog.getCssName(bad.CssPrefix.UI,
        'data_table_multi_select'),
    MENU_ITEM_SELECTED: goog.getCssName(bad.CssPrefix.UI,
        'data_table_multi_select_selected'),
    VIZ_HIDDEN: goog.getCssName(bad.CssPrefix.UI,
        'viz_hidden'),
    MODAL_TITLE: goog.getCssName(
        'modal-dialog-title'),
    MODAL_TITLE_DRAGGABLE: goog.getCssName(
        'modal-dialog-title-draggable'),
    MODAL_TITLE_TEXT: goog.getCssName(
        'modal-dialog-title-text'),
    MODAL_BUTTON: goog.getCssName(bad.CssPrefix.UI,
        'modal-dialog-button'),
    MODAL_BUTTONS: goog.getCssName(
        'modal-dialog-buttons'),
    UPLOAD_PROMPT_WRAPPER: goog.getCssName(bad.CssPrefix.UI,
        'upload_prompt_wrapper'),
    UPLOAD_PROMPT: goog.getCssName(bad.CssPrefix.UI,
        'upload_prompt'),
    UPLOAD_FILE: goog.getCssName(bad.CssPrefix.UI,
        'upload_file'),
    UPLOAD_FILE_DROP_ZONE: goog.getCssName(bad.CssPrefix.UI,
        'file_drop_zone'),
    UPLOAD_FILE_COLUMN: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_col'),
    UPLOAD_FILE_ICON: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_icon'),
    UPLOAD_FILE_SIZE: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_size'),
    UPLOAD_FILE_PROGRESS: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_progress'),
    UPLOAD_FILE_ACTIONS: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_actions'),
    UPLOAD_STATE_DEFAULT: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_state_default'),
    UPLOAD_MOLE: goog.getCssName(bad.CssPrefix.UI,
        'upload_box'),
    UPLOADER: goog.getCssName(bad.CssPrefix.UI,
        'upload_uploader'),
    UPLOADER_TABLE: goog.getCssName(bad.CssPrefix.UI,
        'upload_table'),
    BUTTON_SUBMIT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'btn_submit'),
    BUTTON_FORM_CANCEL: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'btn_cancel'),
    BUTTON_CANCEL: goog.getCssName(bad.CssPrefix.UI,
        'button_cancel'),
    FILE_ITEM_ICON: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_item-icon'),
    FILE_NAME: goog.getCssName(bad.CssPrefix.UI,
        'upload_file_name'),
    BREADCRUMB_END: goog.getCssName(bad.CssPrefix.UI,
        'breadcrumb_end'),
    BREADCRUMB_LINK: goog.getCssName(bad.CssPrefix.UI,
        'breadcrumb_link'),
    COLOR_PICKER_POPUP: goog.getCssName(bad.CssPrefix.UI,
        'color_picker_popup'),
    TIME_PICKER: goog.getCssName(bad.CssPrefix.UI,
        'time_picker'),
    TIME_SETTER: goog.getCssName(bad.CssPrefix.UI,
        'time_setter'),
    TIME_SPAN: goog.getCssName(bad.CssPrefix.UI,
        'time_span'),
    TIME_BUTTON_UP: goog.getCssName(bad.CssPrefix.UI,
        'time_picker_button_up'),
    TIME_BUTTON_DOWN: goog.getCssName(bad.CssPrefix.UI,
        'time_picker_button_down'),
    TIME_UNIT_SETTER: goog.getCssName(bad.CssPrefix.UI,
        'time_picker_units'),
    TIME_READOUT: goog.getCssName(bad.CssPrefix.UI,
        'time_picker_readout'),
    SPLINE_CANVAS: goog.getCssName(bad.CssPrefix.UI,
        'spline_line_canvas'),
    STICKER_CONTAINER: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker_container'),
    STICKER_TITLE: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker_title'),
    STICKER_IO: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker_io'),
    STICKER_IO_IN: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker_io_in'),
    STICKER_IO_OUT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker_io_out'),
    STICKER_CONTENT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker_content'),
    STICKER_TEXT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker_text'),
    STICKER_DEFAULT_READ: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker-default-readfrom'),
    STICKER_DEFAULT_SAME: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker-default-readfrom-same'),
    STICKER_DEFAULT_WRITE: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'sticker-default-saveto'),
    DROP_TARGET_TOOLBOX: goog.getCssName(bad.CssPrefix.UI,
        'drop_target_toolbox'),
    STICKER_HAS_INPUT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'has_input'),
    STICKER_HAS_OUTPUT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'has_output'),
    HAS_ARROW_RIGHT: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'has_arrow_right'),
    TAB_LABEL: goog.getCssName(bad.CssPrefix.UI,
        'tab_label'),
    LINKED: goog.getCssName(bad.CssPrefix.UI,
        'linked'),
    ERROR_BUBBLE: goog.getCssName(bad.CssPrefix.UI,
        'error_bubble'),
    FIELD_ERROR: goog.getCssName(bad.CssPrefix.UI,
        'form_field_error'),
    TWO_THUMB_SLIDER: goog.getCssName(bad.CssPrefix.UI,
        'two_thumb_slider'),
    TOP_TAB: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'tab_top'),
    ADD_EDIT_FORM: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'form'),
    BUBBLE_FONT: goog.getCssName(bad.CssPrefix.UI,
        'bubble_font'),
    BUBBLE_CLOSE_BUTTON: goog.getCssName(bad.CssPrefix.UI,
        'bubble_close_button'),
    BUBBLE_TOP_RIGHT_ANCHOR: goog.getCssName(bad.CssPrefix.UI,
        'bubble_top_right_anchor'),
    BUBBLE_TOP_LEFT_ANCHOR: goog.getCssName(bad.CssPrefix.UI,
        'bubble_top_left_anchor'),
    BUBBLE_TOP_NO_ANCHOR: goog.getCssName(bad.CssPrefix.UI,
        'bubble_top_no_anchor'),
    BUBBLE_BOTTOM_RIGHT_ANCHOR: goog.getCssName(bad.CssPrefix.UI,
        'bubble_bottom_right_anchor'),
    BUBBLE_BOTTOM_LEFT_ANCHOR: goog.getCssName(bad.CssPrefix.UI,
        'bubble_bottom_left_anchor'),
    BUBBLE_BOTTOM_NO_ANCHOR: goog.getCssName(bad.CssPrefix.UI,
        'bubble_bottom_no_anchor'),
    BUBBLE_LEFT: goog.getCssName(bad.CssPrefix.UI,
        'bubble_left'),
    BUBBLE_RIGHT: goog.getCssName(bad.CssPrefix.UI,
        'bubble_right'),
    BUBBLE_WRAPPER: goog.getCssName(bad.CssPrefix.UI,
        'bubble_wrapper'),
    BUBBLE_MESSAGE: goog.getCssName(bad.CssPrefix.UI,
        'bubble_message'),
    ICON_ACTIVITY: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'activity-icon'),
    ICON_TAB: goog.getCssName(bad.CssPrefix.UI,
        'icon_tabs'),
    ROUND_RIGHT_4: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'round_right_4'),
    ROUND_LEFT_4: goog.getCssName(bad.CssPrefix.TEMPLATE,
        'round_left_4'),
    ICON_SQUARE_BIG_CLOSE: goog.getCssName(bad.CssPrefix.ICON,
        'squarebig-close'),
    INFO_TARGET: goog.getCssName(bad.CssPrefix.GADGET,
        'info-target')
};
