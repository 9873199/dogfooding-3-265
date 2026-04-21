export default {
  togglePrev() {
    if (!this.songReady) {
      return
    }
    
    // 修复：切换歌曲前先停止当前音频，防止重叠
    this._stopCurrentAudio()
     
    let index = this.currentIndex - 1;
    if (index == -1) {
      index = this.playlist.length - 1
    }
    this.setCurrentIndex(index)
    this.songReady = false
  },
  // 修复：停止当前音频播放
  _stopCurrentAudio() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
      this.audio.src = ''
    }
    // 停止歌词
    if (this.currentLyric) {
      this.currentLyric.stop()
    }
  },
  async togglePlaying() {
    // 标记用户已交互（用于 iOS 音频自动播放修复）
    this._hasUserInteracted = true
    
    this.playing && this.setPrevTransform()
    this.setPlayingState(!this.playing)
    
    this.currentLyric && this.currentLyric.togglePlay()

    // 处理音频播放/暂停
    if (this.playing) {
      this.audio.play().catch(err => {
        console.log('播放失败:', err)
        this.setPlayingState(false)
      })
    } else {
      this.audio.pause()
    }
  },
  toggleNext() {
    if (!this.songReady) {
      return
    }

    // 修复：切换歌曲前先停止当前音频，防止重叠
    this._stopCurrentAudio()

    let index = this.currentIndex + 1;
    if (index == this.playlist.length) {
      index = 0
    }
    this.setCurrentIndex(index)
    this.songReady = false
  },
}
