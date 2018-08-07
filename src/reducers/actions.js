import { SETPLAYLIST } from './action-types';

export function setPlayList(val) {
  return {
    type: SETPLAYLIST,
    value: val
  }
}
