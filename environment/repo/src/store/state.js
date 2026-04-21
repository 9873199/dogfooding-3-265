import playMode from '@/common/js/config'
import { loadSearch, loadPlay, loadFavorite, loadPlayerState } from '@/common/js/cache'
import { __DPR as DPR } from '@/config/config'

const savedPlayerState = loadPlayerState()

const state = {
  singer: {},
  initialed: false,
  playing: false,
  fullScreen: false,
  playlist: savedPlayerState.playlist || [],
  sequenceList: savedPlayerState.sequenceList || [],
  mode: savedPlayerState.mode !== undefined ? savedPlayerState.mode : playMode.sequence,
  currentIndex: savedPlayerState.currentIndex !== undefined ? savedPlayerState.currentIndex : -1,
  miniPlayerHeight: 0,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay(),
  favoriteList: loadFavorite()
}

export default state
