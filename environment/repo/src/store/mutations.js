import * as types from './mutation-types'
import { savePlayerState } from '@/common/js/cache'

const matutaions = {
  [types.SET_MINI_PLAYER_HEIGHT](state, height) {
    state.miniPlayerHeight = height
  },
  [types.ADD_PLAY_LIST](state, list) {
    state.playlist.push(...list)
    savePlayerState(state)
  },
  [types.DELETE_PLAY_LIST_ITEM](state, index) {
    state.playlist.splice(index, 1)
    savePlayerState(state)
  },
  [types.SET_INITIAL](state, isInited) {
    state.initialed = isInited
  },
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  },
  [types.SET_PLAYING_STATE](state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST](state, list) {
    state.playlist = list
    savePlayerState(state)
  },
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
    savePlayerState(state)
  },
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
    savePlayerState(state)
  },
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
    savePlayerState(state)
  },
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },
  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  },
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  },
  [types.SET_FAVORITE_LIST](state, list) {
    state.favoriteList = list
  }
}

export default matutaions
