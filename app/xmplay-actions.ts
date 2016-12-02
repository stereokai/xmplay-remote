export default class XMPlayActions {
  static VOLUME_UP = 'key512';
  static VOLUME_DOWN = 'key513';

  static CURRENT_TRACK_PLAY_PAUSE = 'key80';
  static CURRENT_TRACK_STOP = 'key81';
  static CURRENT_TRACK_FORWARD = 'key82';
  static CURRENT_TRACK_BACK = 'key83';
  static CURRENT_TRACK_RESTART = 'key84';
  static CURRENT_TRACK_STOP_AT_END = 'key90';

  static CHANGE_TRACK_NEXT = 'key128';
  static CHANGE_TRACK_PREVIOUS = 'key129';
  static CHANGE_TRACK_RANDOM = 'key130';

  static LIST_SORT_SHUFFLE = 'key320';
  static LIST_SORT_TITLE = 'key321';
  static LIST_SORT_FILENAME = 'key322';
  static LIST_SORT_REVERSE = 'key324';

  static LIST_ADD_FILES_URL = 'key368';
  static LIST_ADD_DIRECTORY = 'key369';
  static LIST_REMOVE = 'key370';
  static LIST_PLAY = 'key372';
  static LIST_CLEAR_QUEUE = 'key375';

  static isAction(action) {
    return !!XMPlayActions[action];
  }
}