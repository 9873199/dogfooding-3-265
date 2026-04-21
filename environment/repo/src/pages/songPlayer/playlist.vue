<template>
  <transition>
    <div @click="hide" class="playlist" v-show="showFlag">
      <div class="list-wrap" @click.stop>
        <div class="list-head flex YCenter">
          <div class="playmode-wrapper flex YCenter">
            <p @click="changeMode" class="mode flex Center">
              <i :class="[modeCls,'iconfont']"></i>
            </p>
            <p class="mode-text">{{modeText}}</p>
          </div>
          <div @click="clearList" class="clear-wrapper">
            <i class="cubeic-delete clear"></i>
          </div>
        </div>
        <cube-scroll
          :style="wrapperStyle"
          local
          ref="listContent"
          :data="playlist"
          class="list-content"
        >
          <transition-group name="list" tag="ul">
            <li
              ref="songItem"
              @click="playItem(item,index)"
              :class="['song-item', 'flex',{current:currentSong.id===item.id}]"
              v-for="(item,index) in sequenceList"
              :key="item.id"
            >
              <div class="index-wrapper">
                <p class="text">{{index+1}}</p>
              </div>
              <div class="name-wrapper">
                <p class="name ellipsis">{{item.name}}</p>
              </div>
              <div @click.stop="deleteOne(item)" class="delete-wrapper">
                <i class="cubeic-close"></i>
              </div>
            </li>
          </transition-group>
        </cube-scroll>
        <div class="list-operate"></div>
        <div class="list-close">
          <cube-button @click="hide">关闭</cube-button>
        </div>
      </div>
    </div>
  </transition>
</template>
<script type="text/javascript">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import mixin from './mixin.js'
import playMode from '@/common/js/config'
export default {
  name: '',
  mixins: [mixin],
  props: {
    playlist1: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      showFlag: false
    }
  },
  computed: {
    wrapperStyle() {
      const maxHeight = Math.min(window.innerHeight * 0.4, 300)
      return {
        maxHeight: maxHeight + 'px'
      }
    },
    modeText() {
      return this.mode === playMode.loop
        ? '循环播放'
        : this.mode === playMode.random
        ? '随机播放'
        : '顺序播放'
    }
  },
  methods: {
    ...mapMutations({
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayingState: 'SET_PLAYING_STATE'
    }),
    ...mapActions(['deleteSong', 'deleteSongList']),

    hide() {
      this.showFlag = false
    },
    show() {
      this.showFlag = true

      this.$nextTick(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent()
      })
    },
    clearList() {
      try {
        this.MessageBox.confirm('确定清空列表?').then(action => {
          this.deleteSongList()
          this.hide()
        })
      } catch (err) {
        console.log(err)
      }
    },
    deleteOne(item) {
      this.deleteSong(item)
      if (!this.playlist.length) {
        this.hide()
      }
    },
    playItem(item, index) {
      if (this.currentSong.id === item.id) {
        return
      }
      if (this.mode === playMode.random) {
        index = this.playlist.findIndex(song => item.id === song.id)
      }
      this.setCurrentIndex(index)
      this.setPlayingState(true)
    },
    scrollToCurrent() {
      const index = this.sequenceList.findIndex(
        item => item.id === this.currentSong.id
      )
      this.$refs.listContent.scrollToElement(this.$refs.songItem[index], 300)
    }
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (newSong.id === oldSong.id || newSong.id === undefined) {
        return
      }
      this.$nextTick(this.scrollToCurrent)
    }
  }
}
</script>
<style scoped lang="less">
.list-leave-to {
  transform: translate3d(-100%, -100%, 0);
  // opacity: .4;
  height: 0 !important;
  margin-bottom: 0 !important;
}

.list-leave-active {
  transition: all 0.3s;
}

.v-enter-active,
.v-leave-active {
  transition: all 0.3s;

  .list-wrap {
    transition: inherit;
  }
}

.v-enter,
.v-leave-to {
  background: transparent !important;

  .list-wrap {
    transform: translate3d(0, 100%, 0);
  }
}

.playlist {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 130;
  background: rgba(0, 0, 0, 0.2);
}

.list-head {
  margin-bottom: 5px;
  padding: 8px 10px;

  .playmode-wrapper {
    .mode {
      border: 2px solid;
      border-radius: 50%;
      width: 30px;
      height: 30px;

      .iconfont {
        font-size: 20px;
      }
    }

    .mode-text {
      margin-left: 12px;
      font-size: 14px;
    }
  }

  .clear-wrapper {
    margin-left: auto;

    .clear {
      font-size: 20px;
    }
  }
}

.list-wrap {
  background: #aaa;
  position: fixed;
  width: 100%;
  bottom: 0;

  .list-content {
    padding: 5px 10px;
  }
}

.song-item {
  margin-bottom: 12px;
  height: 20px;

  .index-wrapper {
    margin-right: 8px;
    font-size: 14px;
  }
  .name-wrapper {
    width: 70%;
    font-size: 14px;
  }
  &.current {
    color: red;
  }

  .delete-wrapper {
    margin-left: auto;
    font-size: 1.2em;
  }
}
</style>
