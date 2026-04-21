<template>
  <div @click.once="initPlay" id="app" style>
    <div class="page">
      <nav-bar
        class="home-navbar"
        :navList="navList"
        namePrefix="home"
        ref="navbar"
      ></nav-bar>

      <transition :name="transitionName">
        <keep-alive max="1">
          <router-view
            :style="zIndex"
            :key="$route.query.id"
            :class="[{ fullScreenFixed }, pageCls]"
          />
        </keep-alive>
      </transition>
    </div>
    <!-- 音乐播放器 -->
    <!-- <keep-alive> -->
    <song-player></song-player>
    <!-- </keep-alive> -->
  </div>
</template>
<script>
import SongPlayer from "@/pages/songPlayer";
export default {
  data() {
    return {
      transitionName: "",
      navbarHeight: 0,
      duration: 400,
      navList: [
        {
          label: "歌手",
          name: "singer"
          // link: '/singer'
        },
        {
          label: "歌单",
          name: "songSheet"
          // link: '/songSheet'
        },
        {
          label: "视频",
          name: "mv",
          link: "/mv"
        },
        {
          label: "搜索",
          name: "search",
          link: "/search"
        }
      ]
    };
  },
  computed: {
    zIndex() {
      return this.$route.name
        ? {
            zIndex: this.$route.matched[0].meta.index
          }
        : {};
    },
    pageCls() {
      return this.$route.name ? this.$route.matched[0].name + "-page" : "";
    },
    fullScreenFixed() {
      var matchRoutes = this.$route.matched;
      return matchRoutes[0] && matchRoutes[0].meta.fullScreenFixed;
    }
  },
  watch: {
    $route: function(to, from) {
      if (!to.name || !from.name) {
        return;
      }
      this.oldRoute = from;
      this.setTransitionName(to, from);
      
      // 修复：路由变化时恢复播放器状态
      this.restorePlayerState()
    }
  },
  components: { SongPlayer },
  methods: {
    enter(el, done) {
      el.style.zIndex = this.$route.matched[0].meta.index;
      setTimeout(done, this.duration);
    },
    afterEnter(el) {
      el.style.removeProperty("z-index");
    },
    leave(el, done) {
      el.style.zIndex = this.oldRoute.matched[0].meta.index;

      setTimeout(done, this.duration);
    },
    afterLeave(el) {
      el.style.removeProperty("z-index");
    },
    setTransitionName(to, from) {
      to = to.matched[0];
      from = from.matched[0];

      const fromIndex = from.meta.index;
      const toIndex = to.meta.index;
      if (toIndex < fromIndex) {
        this.transitionName = "prev";
        if (fromIndex >= 4) {
          this.transitionName = "back";
        }
      } else {
        this.transitionName = "next";
        if (!to.meta.isHome) {
          this.transitionName = "forward";
        }
      }
    },
    initPlay() {
      $("audio")[0]
        .play()
        .catch(err => {
          console.error(err);
        });
    },
    // 修复：恢复播放器状态
    restorePlayerState() {
      const store = this.$store
      if (!store) return
      
      const state = store.state
      const hasPlaylist = state.playlist && state.playlist.length > 0
      const isPlaying = state.playing
      
      // 如果有播放列表且之前是播放状态，恢复播放
      if (hasPlaylist && isPlaying) {
        this.$nextTick(() => {
          const audio = $("audio")[0]
          if (audio && audio.paused) {
            // 尝试恢复播放
            audio.play().catch(err => {
              console.log('恢复播放失败:', err)
              // 如果自动恢复失败，更新状态为暂停
              store.commit('SET_PLAYING_STATE', false)
            })
          }
        })
      }
    }
  },
  // 修复：页面可见性变化时恢复播放器
  mounted() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // 页面重新可见时恢复播放器状态
        this.restorePlayerState()
      }
    })
    
    // 监听 pageshow 事件（处理浏览器返回按钮）
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        // 页面从缓存中恢复
        this.restorePlayerState()
      }
    })
  },
  beforeDestroy() {
    document.removeEventListener('visibilitychange', this.restorePlayerState)
    window.removeEventListener('pageshow', this.restorePlayerState)
  }
};
</script>
<style scoped lang="less">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  .posCenter(loadingIcon);

  .page {
    position: fixed;
    width: 100vw;
    top: 0;
  }

  .home-navbar {
    line-height: 2;
  }
}

.loadingIcon {
  font-size: 80px !important;
  z-index: 10;
}

.next-enter-active,
.next-leave-active,
.prev-leave-active,
.prev-enter-active,
.back-enter-active,
.back-leave-active,
.forward-enter-active,
.forward-leave-active {
  transition: all 0.3s;
  width: 100vw;

  position: fixed;
}

.next-enter,
.prev-leave-to,
.back-leave-to,
.forward-enter {
  transform: translate3d(100vw, 0, 0);
}

.next-leave-to,
.prev-enter {
  transform: translate3d(-100vw, 0, 0);
}

.back-enter,
.forward-leave-to {
  transform: translate3d(-20vw, 0, 0);
}
</style>
