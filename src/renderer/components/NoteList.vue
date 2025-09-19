<template>
  <div class="note-list">
    <div class="list-header">
      <h3>{{ selectedNotebook ? selectedNotebook.name : '所有笔记' }}</h3>
      <el-button 
        type="primary" 
        size="small" 
        @click="createNote"
        :disabled="!selectedNotebook"
      >
        新建笔记
      </el-button>
    </div>
    
    <div class="search-box">
      <el-input
        placeholder="搜索笔记..."
        v-model="searchQuery"
        :prefix-icon="Search"
        size="small"
        clearable
        @input="handleSearch"
      />
    </div>
    
    <div class="notes-container">
      <div 
        v-for="note in displayedNotes" 
        :key="note.id"
        class="note-item"
        :class="{ active: activeNoteId === note.id }"
        @click="selectNote(note)"
        @contextmenu="showContextMenu(note, $event)"
      >
        <div class="note-title">{{ note.title || '无标题笔记' }}</div>
        <div class="note-preview">{{ getNotePreview(note.content) }}</div>
        <div class="note-meta">
          <span class="note-date">{{ formatDate(note.updated_at) }}</span>
          <span class="note-tags">
            <el-tag 
              v-for="tag in getNoteTags(note.tags)" 
              :key="tag"
              size="small"
              type="info"
            >
              {{ tag }}
            </el-tag>
          </span>
        </div>
        <div class="note-actions" v-if="activeNoteId === note.id">
          <el-dropdown trigger="click" @click.stop>
            <span class="el-dropdown-link">
              <el-icon><More /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="deleteNote(note)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <div v-if="displayedNotes.length === 0" class="empty-state">
        <p v-if="searchQuery">没有找到匹配的笔记</p>
        <p v-else-if="selectedNotebook">此笔记本中暂无笔记</p>
        <p v-else>暂无笔记</p>
        
        <el-button 
          v-if="!searchQuery && selectedNotebook" 
          type="text" 
          @click="createNote"
        >
          创建第一篇笔记
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, More } from '@element-plus/icons-vue';

export default {
  name: 'NoteList',
  components: {
    Search,
    More
  },
  props: {
    selectedNotebook: Object
  },
  data() {
    return {
      notes: [],
      activeNoteId: null,
      searchQuery: '',
      isSearching: false,
      searchResults: []
    }
  },
  computed: {
    displayedNotes() {
      return this.isSearching ? this.searchResults : this.notes;
    }
  },
  emits: ['note-selected', 'note-created', 'notes-loaded'],
  watch: {
    selectedNotebook: {
      immediate: true,
      async handler(newNotebook) {
        await this.loadNotes(newNotebook ? newNotebook.id : null);
      }
    }
  },
  methods: {
    async loadNotes(notebookId) {
      try {
        this.notes = await window.electronAPI.getNotesByNotebook(notebookId);
        this.isSearching = false;
        this.searchQuery = '';
        
        this.$emit('notes-loaded', this.notes);
        
        // 如果没有活动笔记，选择第一个（如果有）
        if (this.notes.length > 0 && !this.activeNoteId) {
          this.selectNote(this.notes[0]);
        } else if (this.notes.length === 0) {
          this.activeNoteId = null;
          this.$emit('note-selected', null);
        }
      } catch (error) {
        console.error('加载笔记失败:', error);
        ElMessage.error('加载笔记失败');
      }
    },
    
    async handleSearch() {
      if (!this.searchQuery.trim()) {
        this.isSearching = false;
        return;
      }
      
      try {
        this.searchResults = await window.electronAPI.searchNotes(this.searchQuery);
        this.isSearching = true;
      } catch (error) {
        console.error('搜索笔记失败:', error);
        ElMessage.error('搜索笔记失败');
      }
    },
    
    selectNote(note) {
      this.activeNoteId = note.id;
      this.$emit('note-selected', note);
    },
    
    async createNote() {
      if (!this.selectedNotebook) return;
      
      try {
        const newNote = await window.electronAPI.createNote(
          this.selectedNotebook.id,
          '无标题笔记',
          '',
          []
        );
        
        if (newNote) {
          // 重新加载笔记列表以确保数据最新
          await this.loadNotes(this.selectedNotebook.id);
          this.selectNote(newNote);
          this.$emit('note-created', newNote);
        }
      } catch (error) {
        console.error('创建笔记失败:', error);
        ElMessage.error('创建笔记失败');
      }
    },
    
    async deleteNote(note) {
      try {
        await ElMessageBox.confirm(
          `确定要删除笔记"${note.title || '无标题笔记'}"吗？`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        const success = await window.electronAPI.deleteNote(note.id);
        
        if (success) {
          ElMessage.success('笔记删除成功');
          
          // 重新加载笔记列表
          await this.loadNotes(this.selectedNotebook ? this.selectedNotebook.id : null);
          
          // 如果删除的是当前选中的笔记，清空选择
          if (this.activeNoteId === note.id) {
            this.activeNoteId = null;
            this.$emit('note-selected', null);
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除笔记失败:', error);
          ElMessage.error('删除笔记失败');
        }
      }
    },
    
    getNotePreview(content) {
      if (!content) return '暂无内容';
      
      // 移除Markdown标记
      const plainText = content
        .replace(/[#*_~`\[\]()]/g, '')
        .replace(/\n/g, ' ')
        .substring(0, 100);
      
      return plainText.length === 100 ? plainText + '...' : plainText;
    },
    
    getNoteTags(tagsJson) {
      try {
        return tagsJson ? JSON.parse(tagsJson) : [];
      } catch (error) {
        console.error('解析标签失败:', error);
        return [];
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '今天';
      if (diffDays === 2) return '昨天';
      if (diffDays <= 7) return `${diffDays - 1}天前`;
      
      return date.toLocaleDateString();
    },
    
    showContextMenu(note, event) {
      event.preventDefault();
      this.deleteNote(note);
    }
  }
}
</script>

<style scoped>
.note-list {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.list-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.search-box {
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.notes-container {
  flex: 1;
  overflow-y: auto;
}

.note-item {
  padding: 15px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.note-item:hover {
  background: #f5f7f9;
}

.note-item.active {
  background: #ecf5ff;
}

.note-title {
  font-weight: 500;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-preview {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-date {
  font-size: 12px;
  color: #95a5a6;
}

.note-tags {
  display: flex;
  gap: 4px;
}

.note-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.note-item:hover .note-actions,
.note-item.active .note-actions {
  opacity: 1;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #95a5a6;
}

.empty-state p {
  margin-bottom: 10px;
}
</style>