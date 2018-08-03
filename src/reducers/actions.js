import * as TYPE from './action-types';

export function setPlayList(val) {
  return {
    type: TYPE.SETPLAYLIST,
    value: val
  }
}
