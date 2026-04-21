export default {
  togglePrev() {
    if (!this.songReady) {
      return
    }
    if (this.playlist.length === 1) {
      this.loop()
      return
    }
    let index = this.currentIndex - 1
    if (index === -1) {
      index = this.playlist.length - 1
    }
    this.setCurrentIndex(index)
    this.songReady = false
  },
  async togglePlaying() {
    if (!this.songReady && !this.audio.paused) {
      return
    }
    this.playing && this.setPrevTransform()
    this.setPlayingState(!this.playing)
    this.currentLyric && this.currentLyric.togglePlay()
  },
  toggleNext() {
    if (!this.songReady) {
      return
    }
    if (this.playlist.length === 1) {
      this.loop()
      return
    }
    let index = this.currentIndex + 1
    if (index === this.playlist.length) {
      index = 0
    }
    this.setCurrentIndex(index)
    this.songReady = false
  },
  loop() {
    this.audio.currentTime = 0
    this.audio.play().catch(err => {
      console.log('循环播放失败:', err)
    })
    if (this.currentLyric) {
      this.currentLyric.seek(0)
    }
  }
}
