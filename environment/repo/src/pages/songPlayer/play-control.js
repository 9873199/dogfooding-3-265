export default {
  togglePrev() {
    if (!this.songReady || !this.playlist.length) {
      return
    }
    let index = this.currentIndex - 1
    if (index < 0) {
      index = this.playlist.length - 1
    }
    this.songReady = false
    this.waiting = true
    this.setCurrentIndex(index)
  },
  togglePlaying() {
    this.playing && this.setPrevTransform()
    this.setPlayingState(!this.playing)
    if (this.playing && this.audio) {
      this.audio.play().catch(() => {})
    }
    this.currentLyric && this.currentLyric.togglePlay()
  },
  toggleNext() {
    if (!this.songReady || !this.playlist.length) {
      return
    }
    let index = this.currentIndex + 1
    if (index >= this.playlist.length) {
      index = 0
    }
    this.songReady = false
    this.waiting = true
    this.setCurrentIndex(index)
  },
  changeMode() {
    const modeMap = ['sequence', 'loop', 'random']
    let mode = (this.mode + 1) % 3
    this.setPlayMode(mode)
    if (mode === 2) {
      this.setPlaylist(this.shuffle(this.sequenceList))
    } else {
      const index = this.sequenceList.findIndex(s => s.id === this.currentSong.id)
      this.setPlaylist(this.sequenceList)
      this.setCurrentIndex(index)
    }
  }
}
