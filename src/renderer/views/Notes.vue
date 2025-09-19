<template>
  <div class="notes-page">
    <NotebookTree 
      @notebook-selected="handleNotebookSelected"
      @note-selected="handleNoteSelected"
      @note-created="handleNoteCreated"
      @data-updated="handleDataUpdated"
      class="notebook-tree"
      ref="notebookTree"
    />
    <NoteEditor 
      :note="selectedNote"
      @note-saved="handleNoteSaved"
      class="note-editor"
      v-if="selectedNote"
      ref="noteEditor"
    />
    <div class="empty-editor" v-else>
      <div class="empty-content">
        <div class="empty-icon">📝</div>
        <h3>选择或创建一篇笔记开始编辑</h3>
        <p>您可以从左侧列表选择笔记，或创建新笔记</p>
      </div>
    </div>
  </div>
</template>

<script>
import NotebookTree from '../components/NotebookTree.vue'
import NoteEditor from '../components/NoteEditor.vue'

export default {
  name: 'Notes',
  components: {
    NotebookTree,
    NoteEditor
  },
  data() {
    return {
      selectedNotebook: null,
      selectedNote: null,
      notebooks: []
    }
  },
  methods: {
    handleNotebookSelected(notebook) {
      this.selectedNotebook = notebook;
      this.selectedNote = null;
    },
    
    handleNoteSelected(note) {
      this.selectedNote = note;
    },
    
    handleNoteCreated(note) {
      this.selectedNote = note;
    },
    
    handleNoteSaved(updatedNote) {
      // 通知树形组件刷新数据
      if (this.$refs.notebookTree) {
        this.$refs.notebookTree.loadNotebooksWithNotes();
      }
    },
    
    handleDataUpdated(notebooks) {
      this.notebooks = notebooks;
      
      // 如果当前选中的笔记本被删除，清空选择
      if (this.selectedNotebook && 
          !notebooks.some(nb => nb.id === this.selectedNotebook.id)) {
        this.selectedNotebook = null;
        this.selectedNote = null;
      }
      
      // 如果当前选中的笔记不在列表中，清空选择
      if (this.selectedNote && 
          !notebooks.some(nb => 
            nb.notes && nb.notes.some(n => n.id === this.selectedNote.id)
          )) {
        this.selectedNote = null;
      }
    }
  }
}
</script>

<style scoped>
.notes-page {
  display: flex;
  height: 100%;
  background: white;
}

.notebook-tree {
  flex: 0 0 auto;
}

.note-editor {
  flex: 1;
}

.empty-editor {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7f9;
}

.empty-content {
  text-align: center;
  color: #95a5a6;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-content h3 {
  margin: 0 0 8px 0;
  font-weight: 600;
}

.empty-content p {
  margin: 0;
}
</style>