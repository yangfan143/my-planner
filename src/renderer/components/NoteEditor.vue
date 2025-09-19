<template>
  <div class="note-editor">
    <div class="editor-header">
      <el-input
        v-model="currentNote.title"
        placeholder="输入笔记标题"
        class="title-input"
        @blur="saveNoteDebounced"
      />
      <div class="editor-actions">
        <el-button-group>
          <el-button 
            :type="editorMode === 'edit' ? 'primary' : ''"
            @click="editorMode = 'edit'"
          >
            编辑
          </el-button>
          <el-button 
            :type="editorMode === 'preview' ? 'primary' : ''"
            @click="editorMode = 'preview'"
          >
            预览
          </el-button>
        </el-button-group>
        <el-button 
          type="primary" 
          @click="saveNote"
          :loading="isSaving"
        >
          {{ isSaving ? '保存中...' : '保存' }}
        </el-button>
      </div>
    </div>
    
    <div class="editor-tags">
      <el-tag
        v-for="tag in currentNote.tags"
        :key="tag"
        closable
        @close="removeTag(tag)"
      >
        {{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible"
        ref="tagInputRef"
        v-model="inputValue"
        size="small"
        @keyup.enter="addTag"
        @blur="addTag"
      />
      <el-button v-else size="small" @click="showInput">
        + 添加标签
      </el-button>
    </div>
    
    <div class="editor-content">
      <textarea
        v-if="editorMode === 'edit'"
        v-model="currentNote.content"
        placeholder="开始编写您的笔记..."
        class="markdown-editor"
        @input="handleContentChange"
        ref="editorTextarea"
      ></textarea>
      <div v-else class="markdown-preview" v-html="compiledMarkdown"></div>
    </div>
    
    <!-- 状态提示 -->
    <div class="editor-status" v-if="lastSaved">
      已保存: {{ formatTime(lastSaved) }}
    </div>
  </div>
</template>

<script>
import { marked } from 'marked';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash-es';

export default {
  name: 'NoteEditor',
  props: {
    note: Object
  },
  data() {
    return {
      currentNote: {
        id: null,
        title: '',
        content: '',
        tags: [],
        updated_at: null
      },
      editorMode: 'edit',
      inputVisible: false,
      inputValue: '',
      isSaving: false,
      lastSaved: null,
      saveNoteDebounced: debounce(() => {
        this.saveNote();
      }, 1000)
    }
  },
  computed: {
    compiledMarkdown() {
      return marked(this.currentNote.content || '');
    }
  },
  watch: {
    note: {
      immediate: true,
      handler(newNote) {
        if (newNote) {
          this.currentNote = { 
            ...newNote,
            tags: this.getNoteTags(newNote.tags)
          };
        } else {
          this.currentNote = {
            id: null,
            title: '',
            content: '',
            tags: [],
            updated_at: null
          };
        }
      }
    }
  },
  mounted() {
    // 配置marked选项
    marked.setOptions({
      breaks: true,
      gfm: true
    });
    
    // 监听键盘快捷键
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    getNoteTags(tagsJson) {
      try {
        return tagsJson ? JSON.parse(tagsJson) : [];
      } catch (error) {
        console.error('解析标签失败:', error);
        return [];
      }
    },
    
    handleContentChange() {
      // 触发防抖保存
      this.saveNoteDebounced();
    },
    
    async saveNote() {
      if (!this.currentNote.id) return;
      
      this.isSaving = true;
      
      try {
        // 确保 tags 是可序列化的数组
        const safeTags = Array.isArray(this.currentNote.tags) ? [...this.currentNote.tags] : [];
        
        const updatedNote = await window.electronAPI.updateNote(this.currentNote.id, {
          title: this.currentNote.title || '',
          content: this.currentNote.content || '',
          tags: safeTags,
          notebook_id: this.currentNote.notebook_id || null
        });
        
        if (updatedNote) {
          this.lastSaved = new Date();
          this.$emit('note-saved', updatedNote);
        }
      } catch (error) {
        console.error('保存笔记失败:', error);
        ElMessage.error('保存笔记失败');
      } finally {
        this.isSaving = false;
      }
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.tagInputRef.focus();
      });
    },
    
    addTag() {
      if (this.inputValue && !this.currentNote.tags.includes(this.inputValue)) {
        this.currentNote.tags.push(this.inputValue);
        this.saveNoteDebounced();
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    
    removeTag(tag) {
      this.currentNote.tags = this.currentNote.tags.filter(t => t !== tag);
      this.saveNoteDebounced();
    },
    
    formatTime(date) {
      return new Date(date).toLocaleTimeString();
    },
    
    handleKeydown(event) {
      // 保存快捷键: Ctrl/Cmd + S
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        this.saveNote();
      }
      
      // 切换模式快捷键: Ctrl/Cmd + E
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        this.editorMode = this.editorMode === 'edit' ? 'preview' : 'edit';
      }
    },
    
    focusEditor() {
      if (this.$refs.editorTextarea) {
        this.$refs.editorTextarea.focus();
      }
    }
  }
}
</script>

<style scoped>
.note-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  position: relative;
}

.editor-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-input {
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  margin-right: 15px;
}

.title-input :deep(.el-input__wrapper) {
  box-shadow: none;
  padding: 0;
}

.title-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
}

.editor-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.editor-tags {
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.markdown-editor {
  width: 100%;
  height: 100%;
  border: none;
  padding: 20px;
  resize: none;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
}

.markdown-preview {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.markdown-preview :deep(h1) {
  font-size: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 8px;
}

.markdown-preview :deep(h2) {
  font-size: 20px;
  margin-bottom: 12px;
  padding-bottom: 6px;
}

.markdown-preview :deep(h3) {
  font-size: 18px;
  margin-bottom: 10px;
}

.markdown-preview :deep(p) {
  margin-bottom: 12px;
  line-height: 1.6;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin-bottom: 12px;
  padding-left: 24px;
}

.markdown-preview :deep(li) {
  margin-bottom: 4px;
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  margin-left: 0;
  color: #666;
  margin-bottom: 12px;
}

.markdown-preview :deep(code) {
  background: #f5f7f9;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(pre) {
  background: #f5f7f9;
  padding: 12px;
  border-radius: 4px;
  overflow: auto;
  margin-bottom: 12px;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-preview :deep(th) {
  background-color: #f5f7f9;
}

.markdown-preview :deep(a) {
  color: #3498db;
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.editor-status {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 12px;
  color: #95a5a6;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>