<template>
  <div class="markdown-toolbar">
    <el-button-group>
      <el-button 
        size="small" 
        @click="insertText('**', '**', '粗体')"
        title="粗体"
      >
        <strong>B</strong>
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('*', '*', '斜体')"
        title="斜体"
      >
        <em>I</em>
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('`', '`', '代码')"
        title="代码"
      >
        <code>&lt;/&gt;</code>
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('[', '](url)', '链接')"
        title="链接"
      >
        🔗
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('![', '](image.png)', '图片')"
        title="图片"
      >
        🖼️
      </el-button>
    </el-button-group>
    
    <el-button-group>
      <el-button 
        size="small" 
        @click="insertText('# ', '', '一级标题')"
        title="一级标题"
      >
        H1
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('## ', '', '二级标题')"
        title="二级标题"
      >
        H2
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('- ', '', '列表')"
        title="无序列表"
      >
        • List
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('1. ', '', '有序列表')"
        title="有序列表"
      >
        1. List
      </el-button>
      <el-button 
        size="small" 
        @click="insertText('> ', '', '引用')"
        title="引用"
      >
        > Quote
      </el-button>
    </el-button-group>
  </div>
</template>

<script>
export default {
  name: 'MarkdownToolbar',
  emits: ['insert-text'],
  methods: {
    insertText(before, after, placeholder = '') {
      this.$emit('insert-text', { before, after, placeholder });
    }
  }
}
</script>

<style scoped>
.markdown-toolbar {
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  background: #f9f9f9;
}

.markdown-toolbar :deep(.el-button) {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.markdown-toolbar :deep(.el-button-group) {
  display: flex;
}
</style>