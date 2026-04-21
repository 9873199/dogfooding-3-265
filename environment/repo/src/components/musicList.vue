<template>
  <div class="list-wrap">
    <!-- 修复：使用虚拟列表优化长列表性能 -->
    <virtual-list
      v-if="useVirtual && list.length > virtualThreshold"
      :list="list"
      :item-height="itemHeight"
      :buffer="buffer"
      @scroll="onScroll"
      ref="virtualList"
    >
      <template slot-scope="{ item, index }">
        <div
          @click="selectItem(item, index)"
          :class="['list-item']"
        >
          <div :class="['sortIndex', { newLoad: item.newLoad }]">{{ index + preIndex + 1 }}</div>
          <div class="text-wrap">
            <div class="text-name">
              <h2 v-text="item.name" class="name ellipsis"></h2>
            </div>
            <div class="text-singer">
              <p v-text="item.singer" class="singer ellipsis"></p>
            </div>
          </div>
        </div>
      </template>
    </virtual-list>
    
    <!-- 短列表使用原生渲染 -->
    <template v-else>
      <div
        :style="{ marginTop: $attrs.marginTop + 'px' }"
        @click="selectItem(item, index)"
        :class="['list-item']"
        :key="item.id || index"
        v-for="(item, index) in list"
      >
        <div :class="['sortIndex', { newLoad: item.newLoad }]">{{ index + preIndex + 1 }}</div>
        <div class="text-wrap">
          <div class="text-name">
            <h2 v-text="item.name" class="name ellipsis"></h2>
          </div>
          <div class="text-singer">
            <p v-text="item.singer" class="singer ellipsis"></p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script type="text/javascript">
import { mapActions } from 'vuex'
import VirtualList from './virtualList.vue'

export default {
  name: 'music-list',
  components: {
    VirtualList
  },
  data() {
    return {
      // 修复：虚拟列表配置
      useVirtual: true,
      virtualThreshold: 50, // 超过50条使用虚拟列表
      itemHeight: 40, // 每项高度
      buffer: 3 // 缓冲区数量
    }
  },
  props: {
    preIndex: {
      type: Number,
      default: 0
    },
    limit: {
      type: Number,
      default: 0
    },
    list: {
      type: Array,
      default: () => []
    }
  },
  mounted() {
    // 修复：使用 requestAnimationFrame 优化性能
    requestAnimationFrame(() => {
      const height = $('.list-item').height() || this.itemHeight
      this.$emit('hasHeight', height)
    })
  },
  // 修复：组件销毁时清理
  beforeDestroy() {
    this.useVirtual = false
  },
  methods: {
    ...mapActions(['selectPlay']),
    
    keys({ id }) {
      return id
    },
    async selectItem(item, index) {
      // 修复：使用深拷贝避免引用问题
      this.selectPlay({ list: this.__cloneDeep__(this.list), index })
    },
    onScroll({ scrollTop, startIndex }) {
      // 触发滚动事件
      this.$emit('scroll', { scrollTop, startIndex })
    },
    // 修复：刷新虚拟列表
    refresh() {
      if (this.$refs.virtualList) {
        this.$refs.virtualList.refresh()
      }
    }
  }
}
</script>
<style scoped lang="less">
.list-wrap {
  padding: 0 10px;
}

.list-item {
  padding: 0 12px;
  background: #fff;
  display: flex;
  align-items: center;
  height: 40px;

  border-radius: 3px;

  .sortIndex {
    
    margin-right: 10px;

    &.newLoad {
      color: orange;
    }
  }

  .text-wrap {
    width: 100%;
    min-width: 0;
    display: flex;

    justify-content: space-between;

    .text-name {
      width: 140px;

      .name {
        color: #333;
        .font-dpr(14Px);
      }
    }

    .text-singer {
      width: 50%;
       
      text-align: right;
       

      min-width: 0;

       
    }
  }
}
</style>
