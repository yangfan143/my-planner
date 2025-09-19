<template>
  <div class="notebook-tree">
    <div class="sidebar-header">
      <h3>笔记本</h3>
      <el-button 
        type="primary" 
        size="small" 
        @click="showCreateNotebookDialog"
        circle
      >
        <span>+</span>
      </el-button>
    </div>
    
    <div class="search-box">
      <el-input
        placeholder="搜索笔记本或笔记..."
        v-model="searchQuery"
        :prefix-icon="Search"
        size="small"
        clearable
        @input="handleSearch"
      />
    </div>
    
    <div class="notebook-list">
      <div 
        v-for="notebook in displayedItems" 
        :key="notebook.id"
        class="notebook-item"
        :class="{ active: activeNotebookId === notebook.id && !activeNoteId }"
      >
        <div class="notebook-header" @click="toggleNotebook(notebook)">
          <div class="notebook-info">
            <div class="notebook-icon">
              {{ notebook.expanded ? '📂' : '📁' }}
            </div>
            <div class="notebook-name">{{ notebook.name }}</div>
            <div class="note-count">{{ notebook.note_count }} 篇笔记</div>
          </div>
          <div class="notebook-actions">
            <el-button 
              type="text" 
              size="small" 
              @click.stop="createNote(notebook)"
              title="新建笔记"
            >
              <el-icon><DocumentAdd /></el-icon>
            </el-button>
            <el-dropdown trigger="click" @click.stop>
              <el-button type="text" size="small" title="更多操作">
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="editNotebook(notebook)">
                    <el-icon><Edit /></el-icon>重命名
                  </el-dropdown-item>
                  <el-dropdown-item @click="deleteNotebook(notebook)" divided>
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        
        <div class="notes-container" v-if="notebook.expanded">
          <div 
            v-for="note in notebook.notes" 
            :key="note.id"
            class="note-item"
            :class="{ active: activeNoteId === note.id }"
            @click="selectNote(note)"
          >
            <div class="note-info">
              <div class="note-icon">📄</div>
              <div class="note-title">{{ note.title || '无标题笔记' }}</div>
            </div>
            <div class="note-actions">
              <el-dropdown trigger="click" @click.stop>
                <el-button type="text" size="small" title="更多操作">
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="deleteNote(note)">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div v-if="notebook.notes.length === 0" class="empty-notes">
            <p>此笔记本中暂无笔记</p>
            <el-button type="text" @click="createNote(notebook)">
              创建第一篇笔记
            </el-button>
          </div>
        </div>
      </div>
      
      <div v-if="displayedItems.length === 0" class="empty-state">
        <p v-if="searchQuery">没有找到匹配的内容</p>
        <p v-else>暂无笔记本</p>
        
        <el-button 
          v-if="!searchQuery" 
          type="text" 
          @click="showCreateNotebookDialog"
        >
          创建第一个笔记本
        </el-button>
      </div>
    </div>
    
    <!-- 创建/编辑笔记本对话框 -->
    <el-dialog
      :title="isEditingNotebook ? '重命名笔记本' : '创建笔记本'"
      v-model="notebookDialogVisible"
      width="400px"
      :before-close="handleDialogClose"
    >
      <el-form :model="notebookForm" label-width="80px">
        <el-form-item label="名称">
          <el-input 
            v-model="notebookForm.name" 
            autocomplete="off"
            placeholder="输入笔记本名称"
            @keyup.enter="saveNotebook"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="notebookDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNotebook">
            {{ isEditingNotebook ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, DocumentAdd, More, Edit, Delete } from '@element-plus/icons-vue';

export default {
  name: 'NotebookTree',
  components: {
    Search,
    DocumentAdd,
    More,
    Edit,
    Delete
  },
  data() {
    return {
      notebooks: [],
      activeNotebookId: null,
      activeNoteId: null,
      searchQuery: '',
      isSearching: false,
      searchResults: [],
      notebookDialogVisible: false,
      isEditingNotebook: false,
      notebookForm: {
        id: null,
        name: ''
      }
    }
  },
  computed: {
    displayedItems() {
      return this.isSearching ? this.searchResults : this.notebooks;
    }
  },
  emits: ['notebook-selected', 'note-selected', 'note-created', 'data-updated'],
  async mounted() {
    await this.loadNotebooksWithNotes();
  },
  methods: {
    async loadNotebooksWithNotes() {
      try {
        this.notebooks = await window.electronAPI.getNotebooksWithNotes();
        this.$emit('data-updated', this.notebooks);
      } catch (error) {
        console.error('加载笔记本和笔记失败:', error);
        ElMessage.error('加载笔记本和笔记失败');
      }
    },
    
    toggleNotebook(notebook) {
      // 切换展开状态
      notebook.expanded = !notebook.expanded;
      
      // 如果展开并且有笔记，选择第一个笔记
      if (notebook.expanded && notebook.notes.length > 0) {
        this.selectNote(notebook.notes[0]);
      } else if (!notebook.expanded) {
        // 如果收起，选择笔记本本身
        this.selectNotebook(notebook);
      }
    },
    
    selectNotebook(notebook) {
      this.activeNotebookId = notebook.id;
      this.activeNoteId = null;
      this.$emit('notebook-selected', notebook);
    },
    
    selectNote(note) {
      this.activeNotebookId = note.notebook_id;
      this.activeNoteId = note.id;
      this.$emit('note-selected', note);
    },
    
    async handleSearch() {
      if (!this.searchQuery.trim()) {
        this.isSearching = false;
        return;
      }
      
      try {
        // 搜索笔记
        const notes = await window.electronAPI.searchNotes(this.searchQuery);
        
        // 按笔记本分组
        const notebookMap = {};
        notes.forEach(note => {
          if (!notebookMap[note.notebook_id]) {
            notebookMap[note.notebook_id] = {
              id: note.notebook_id,
              name: '搜索结果', // 临时名称，实际应该获取笔记本名称
              note_count: 0,
              notes: [],
              expanded: true
            };
          }
          notebookMap[note.notebook_id].notes.push(note);
          notebookMap[note.notebook_id].note_count++;
        });
        
        this.searchResults = Object.values(notebookMap);
        this.isSearching = true;
      } catch (error) {
        console.error('搜索失败:', error);
        ElMessage.error('搜索失败');
      }
    },
    
    showCreateNotebookDialog() {
      this.isEditingNotebook = false;
      this.notebookForm = { id: null, name: '' };
      this.notebookDialogVisible = true;
    },
    
    editNotebook(notebook) {
      this.isEditingNotebook = true;
      this.notebookForm = { id: notebook.id, name: notebook.name };
      this.notebookDialogVisible = true;
    },
    
    async saveNotebook() {
      if (!this.notebookForm.name.trim()) {
        ElMessage.error('笔记本名称不能为空');
        return;
      }
      
      try {
        if (this.isEditingNotebook) {
          const success = await window.electronAPI.updateNotebook(
            this.notebookForm.id, 
            this.notebookForm.name
          );
          
          if (success) {
            ElMessage.success('笔记本更新成功');
            await this.loadNotebooksWithNotes();
          }
        } else {
          const newNotebook = await window.electronAPI.createNotebook(
            this.notebookForm.name
          );
          
          if (newNotebook) {
            ElMessage.success('笔记本创建成功');
            await this.loadNotebooksWithNotes();
          }
        }
        
        this.notebookDialogVisible = false;
      } catch (error) {
        console.error('保存笔记本失败:', error);
        ElMessage.error('保存笔记本失败');
      }
    },
    
    async deleteNotebook(notebook) {
      try {
        await ElMessageBox.confirm(
          `确定要删除笔记本"${notebook.name}"吗？此操作将删除笔记本中的所有笔记。`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        const success = await window.electronAPI.deleteNotebook(notebook.id);
        
        if (success) {
          ElMessage.success('笔记本删除成功');
          await this.loadNotebooksWithNotes();
          
          // 如果删除的是当前选中的笔记本，清空选择
          if (this.activeNotebookId === notebook.id) {
            this.activeNotebookId = null;
            this.activeNoteId = null;
            this.$emit('notebook-selected', null);
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除笔记本失败:', error);
          ElMessage.error('删除笔记本失败');
        }
      }
    },
    
    async createNote(notebook) {
      try {
        const newNote = await window.electronAPI.createNote(
          notebook.id,
          '无标题笔记',
          '',
          []
        );
        
        if (newNote) {
          ElMessage.success('笔记创建成功');
          
          // 重新加载数据
          await this.loadNotebooksWithNotes();
          
          // 展开笔记本并选择新笔记
          const updatedNotebook = this.notebooks.find(nb => nb.id === notebook.id);
          if (updatedNotebook) {
            updatedNotebook.expanded = true;
            this.selectNote(newNote);
            this.$emit('note-created', newNote);
          }
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
          
          // 重新加载数据
          await this.loadNotebooksWithNotes();
          
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
    
    handleDialogClose(done) {
      this.notebookDialogVisible = false;
      done();
    }
  }
}
</script>

<style scoped>
.notebook-tree {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  background: white;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.search-box {
  padding: 10px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.notebook-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px 0;
}

.notebook-item {
  margin-bottom: 5px;
}

.notebook-header {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  cursor: pointer;
  transition: background 0.2s;
  justify-content: space-between;
}

.notebook-header:hover {
  background: #f5f7f9;
}

.notebook-item.active .notebook-header {
  background: #ecf5ff;
}

.notebook-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.notebook-icon {
  font-size: 16px;
  margin-right: 8px;
  flex-shrink: 0;
}

.notebook-name {
  font-weight: 500;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-count {
  font-size: 12px;
  color: #95a5a6;
  flex-shrink: 0;
}

.notebook-actions {
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
}

.notebook-header:hover .notebook-actions,
.notebook-item.active .notebook-actions {
  opacity: 1;
}

.notes-container {
  padding-left: 30px;
}

.note-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.2s;
  justify-content: space-between;
}

.note-item:hover {
  background: #f5f7f9;
}

.note-item.active {
  background: #ecf5ff;
}

.note-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.note-icon {
  font-size: 14px;
  margin-right: 8px;
  flex-shrink: 0;
}

.note-title {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.note-item:hover .note-actions {
  opacity: 1;
}

.empty-notes {
  text-align: center;
  padding: 20px 10px;
  color: #95a5a6;
  font-size: 13px;
}

.empty-notes p {
  margin-bottom: 8px;
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