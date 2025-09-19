<template>
  <div class="notebook-sidebar">
    <div class="sidebar-header">
      <h3>笔记本</h3>
      <el-button 
        type="primary" 
        size="large" 
        @click="showCreateNotebookDialog"
        circle
      >
        <span>+</span>
      </el-button>
    </div>
    
    <div class="notebook-list">
      <div 
        v-for="notebook in notebooks" 
        :key="notebook.id"
        class="notebook-item"
        :class="{ active: activeNotebookId === notebook.id }"
        @click="selectNotebook(notebook)"
        @contextmenu="showContextMenu(notebook, $event)"
      >
        <div class="notebook-icon">📓</div>
        <div class="notebook-info">
          <div class="notebook-name">{{ notebook.name }}</div>
          <div class="note-count">{{ notebook.note_count }} 篇笔记</div>
        </div>
        <div class="notebook-actions" v-if="activeNotebookId === notebook.id">
          <el-dropdown trigger="click" @click.stop>
            <span class="el-dropdown-link">
              <el-icon><More /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="editNotebook(notebook)">重命名</el-dropdown-item>
                <el-dropdown-item @click="deleteNotebook(notebook)" divided>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <div v-if="notebooks.length === 0" class="empty-state">
        <p>暂无笔记本</p>
        <el-button type="text" @click="showCreateNotebookDialog">
          创建第一个笔记本
        </el-button>
      </div>
    </div>
    
    <!-- 创建笔记本对话框 -->
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
import { More } from '@element-plus/icons-vue';

export default {
  name: 'NotebookSidebar',
  components: {
    More
  },
  data() {
    return {
      notebooks: [],
      activeNotebookId: null,
      notebookDialogVisible: false,
      isEditingNotebook: false,
      notebookForm: {
        id: null,
        name: ''
      }
    }
  },
  emits: ['notebook-selected', 'notebooks-updated'],
  async mounted() {
    await this.loadNotebooks();
  },
  methods: {
    async loadNotebooks() {
      try {
        this.notebooks = await window.electronAPI.getAllNotebooks();
        
        // 如果没有活动笔记本，选择第一个
        if (this.notebooks.length > 0 && !this.activeNotebookId) {
          this.selectNotebook(this.notebooks[0]);
        }
        
        this.$emit('notebooks-updated', this.notebooks);
      } catch (error) {
        console.error('加载笔记本失败:', error);
        ElMessage.error('加载笔记本失败');
      }
    },
    
    selectNotebook(notebook) {
      this.activeNotebookId = notebook.id;
      this.$emit('notebook-selected', notebook);
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
            await this.loadNotebooks();
          }
        } else {
          const newNotebook = await window.electronAPI.createNotebook(
            this.notebookForm.name
          );
          
          if (newNotebook) {
            ElMessage.success('笔记本创建成功');
            await this.loadNotebooks();
            
            // 选中新创建的笔记本
            this.selectNotebook(newNotebook);
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
          await this.loadNotebooks();
          
          // 如果删除的是当前选中的笔记本，清空选择
          if (this.activeNotebookId === notebook.id) {
            this.activeNotebookId = null;
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
    
    showContextMenu(notebook, event) {
      event.preventDefault();
      // 可以在这里实现自定义右键菜单
      this.editNotebook(notebook);
    },
    
    handleDialogClose(done) {
      this.notebookDialogVisible = false;
      done();
    }
  }
}
</script>

<style scoped>
.notebook-sidebar {
  width: 280px;
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

.notebook-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.notebook-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.notebook-item:hover {
  background: #f5f7f9;
}

.notebook-item.active {
  background: #ecf5ff;
}

.notebook-icon {
  font-size: 20px;
  margin-right: 10px;
}

.notebook-info {
  flex: 1;
}

.notebook-name {
  font-weight: 500;
  margin-bottom: 2px;
}

.note-count {
  font-size: 12px;
  color: #95a5a6;
}

.notebook-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.notebook-item:hover .notebook-actions,
.notebook-item.active .notebook-actions {
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