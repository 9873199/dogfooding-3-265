<template>
  <div ref="wrapper" class="virtual-list-wrapper" @scroll="onScroll">
    <div :style="{ height: totalHeight + 'px' }" class="virtual-list-phantom"></div>
    <div :style="{ transform: `translate3d(0, ${offset}px, 0)` }" class="virtual-list-content">
      <div
        v-for="item in visibleData"
        :key="item.id || item.index"
        :style="{ height: itemHeight + 'px' }"
        class="virtual-list-item"
      >
        <slot :item="item.data" :index="item.index"></slot>
      </div>
    </div>
  </div>
</template>

<script>
// 修复：虚拟列表组件，解决长列表滚动卡顿和内存泄漏问题
export default {
  name: 'VirtualList',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    itemHeight: {
      type: Number,
      default: 50
    },
    buffer: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
      offset: 0,
      visibleCount: 0,
      startIndex: 0
    }
  },
  computed: {
    totalHeight() {
      return this.list.length * this.itemHeight
    },
    visibleData() {
      const endIndex = Math.min(this.startIndex + this.visibleCount + this.buffer, this.list.length)
      const startIndex = Math.max(0, this.startIndex - this.buffer)
      
      return this.list.slice(startIndex, endIndex).map((item, index) => ({
        data: item,
        index: startIndex + index,
        id: item.id || `item-${startIndex + index}`
      }))
    }
  },
  mounted() {
    this.init()
    window.addEventListener('resize', this.init)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.init)
    // 清理引用，防止内存泄漏
    this.$refs.wrapper && (this.$refs.wrapper.onscroll = null)
  },
  methods: {
    init() {
      if (!this.$refs.wrapper) return
      this.visibleCount = Math.ceil(this.$refs.wrapper.clientHeight / this.itemHeight) + 1
    },
    onScroll() {
      if (!this.$refs.wrapper) return
      
      const scrollTop = this.$refs.wrapper.scrollTop
      this.startIndex = Math.floor(scrollTop / this.itemHeight)
      this.offset = this.startIndex * this.itemHeight
      
      // 触发滚动事件供父组件使用
      this.$emit('scroll', {
        scrollTop,
        startIndex: this.startIndex
      })
    },
    scrollToIndex(index) {
      if (!this.$refs.wrapper) return
      this.$refs.wrapper.scrollTop = index * this.itemHeight
    },
    scrollToTop() {
      if (!this.$refs.wrapper) return
      this.$refs.wrapper.scrollTop = 0
    },
    refresh() {
      this.init()
      this.onScroll()
    }
  },
  watch: {
    list() {
      this.$nextTick(() => {
        this.refresh()
      })
    }
  }
}
</script>

<style scoped>
.virtual-list-wrapper {
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  -webkit-overflow-scrolling: touch;
}

.virtual-list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.virtual-list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  will-change: transform;
}

.virtual-list-item {
  box-sizing: border-box;
}
</style>
