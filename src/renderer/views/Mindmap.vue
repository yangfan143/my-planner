<template>
  <div class="mindmap-container">
    <div class="mindmap-header">
      <h2>思维导图</h2>
      <div class="mindmap-controls">
        <button class="control-btn" @click="saveMindmap">
          <span>保存</span>
        </button>
        <button class="control-btn" @click="exportMindmap">
          <span>导出</span>
        </button>
        <button class="control-btn" @click="resetMindmap">
          <span>重置</span>
        </button>
      </div>
    </div>

    <!-- 思维导图工具栏 -->
    <div class="mindmap-toolbar">
      <button class="toolbar-btn" @click="addNode">
        <span>添加节点</span>
      </button>
      <button class="toolbar-btn" @click="deleteSelectedNode" :disabled="!selectedNode">
        <span>删除节点</span>
      </button>
      <button class="toolbar-btn" @click="editNode" :disabled="!selectedNode">
        <span>编辑节点</span>
      </button>
      <div class="toolbar-separator"></div>
      <button class="toolbar-btn" @click="zoomIn">
        <span>+</span>
      </button>
      <button class="toolbar-btn" @click="zoomOut">
        <span>-</span>
      </button>
      <button class="toolbar-btn" @click="resetZoom">
        <span>重置缩放</span>
      </button>
    </div>

    <!-- 思维导图主体区域 -->
    <div class="mindmap-content">
      <div class="mindmap-canvas" ref="mindmapCanvas" @wheel="handleWheel">
        <!-- 思维导图将在这里通过渲染函数动态生成 -->
        <div 
          class="mindmap-wrapper" 
          :style="{ transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)` }"
        >
          <div 
            v-for="node in mindmapData.nodes" 
            :key="node.id"
            :class="['mindmap-node', { 'selected': selectedNode === node.id, 'root-node': node.isRoot }]"
            :style="getNodeStyle(node)"
            @click="selectNode(node.id)"
            @mousedown="startDragging(node.id, $event)"
          >
            <div class="node-content">
              <div class="node-title">{{ node.title }}</div>
              <div class="node-description" v-if="node.description">{{ node.description }}</div>
            </div>
            <!-- 连接线将在这里通过渲染函数动态生成 -->
            <div v-for="childId in node.children" :key="`connection-${node.id}-${childId}`" class="connection-line" />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑节点弹窗 -->
    <div v-if="showNodeModal" class="modal-overlay" @click.self="closeNodeModal">
      <div class="modal node-modal">
        <div class="modal-header">
          <h3>{{ isEditingNode ? '编辑节点' : '添加节点' }}</h3>
          <button class="close-btn" @click="closeNodeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>节点标题</label>
            <input 
              type="text" 
              v-model="currentNode.title" 
              placeholder="请输入节点标题" 
              class="node-input"
            >
          </div>
          <div class="form-group">
            <label>节点描述（可选）</label>
            <textarea 
              v-model="currentNode.description" 
              placeholder="请输入节点描述" 
              class="node-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeNodeModal">取消</button>
          <button class="confirm-btn" @click="saveNode">{{ isEditingNode ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>

    <!-- 空状态显示 -->
    <div class="empty-state" v-if="mindmapData.nodes.length === 0">
      <div class="empty-icon">🧠</div>
      <div class="empty-text">暂无思维导图</div>
      <button class="create-mindmap-btn" @click="createNewMindmap">创建新思维导图</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Mindmap',
  data() {
    return {
      // 思维导图数据
      mindmapData: {
        id: null,
        title: '我的思维导图',
        nodes: [],
        connections: []
      },
      // 选中的节点ID
      selectedNode: null,
      // 添加/编辑节点弹窗状态
      showNodeModal: false,
      isEditingNode: false,
      currentNode: {
        id: null,
        title: '',
        description: '',
        parentId: null,
        x: 0,
        y: 0,
        isRoot: false
      },
      // 拖拽状态
      isDragging: false,
      draggedNodeId: null,
      dragOffset: { x: 0, y: 0 },
      // 缩放和移动状态
      scale: 1,
      translateX: 0,
      translateY: 0,
      // 拖拽画布状态
      isDraggingCanvas: false,
      canvasDragStart: { x: 0, y: 0 }
    }
  },
  mounted() {
    // 加载思维导图数据
    this.loadMindmapData()
    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  },
  beforeUnmount() {
    // 移除全局鼠标事件监听
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  },
  methods: {
    // 加载思维导图数据
    loadMindmapData() {
      // 这里应该从API获取实际的思维导图数据
      // 目前使用模拟数据
      this.loadMockData()
    },
    
    // 加载模拟数据
    loadMockData() {
      this.mindmapData = {
        id: 'mock-mindmap-1',
        title: '项目计划思维导图',
        nodes: [
          {
            id: '1',
            title: '项目计划',
            description: '项目总体规划',
            parentId: null,
            x: 0,
            y: 0,
            isRoot: true,
            children: ['2', '3', '4']
          },
          {
            id: '2',
            title: '需求分析',
            description: '收集和分析用户需求',
            parentId: '1',
            x: -300,
            y: -150,
            isRoot: false,
            children: ['5', '6']
          },
          {
            id: '3',
            title: '设计阶段',
            description: 'UI/UX设计和技术方案设计',
            parentId: '1',
            x: 0,
            y: -150,
            isRoot: false,
            children: ['7']
          },
          {
            id: '4',
            title: '开发阶段',
            description: '前端和后端开发',
            parentId: '1',
            x: 300,
            y: -150,
            isRoot: false,
            children: ['8', '9']
          },
          {
            id: '5',
            title: '用户调研',
            description: '了解用户需求和痛点',
            parentId: '2',
            x: -450,
            y: -250,
            isRoot: false,
            children: []
          },
          {
            id: '6',
            title: '需求文档',
            description: '编写详细的需求规格说明书',
            parentId: '2',
            x: -150,
            y: -250,
            isRoot: false,
            children: []
          },
          {
            id: '7',
            title: '原型设计',
            description: '创建界面原型和交互设计',
            parentId: '3',
            x: 0,
            y: -250,
            isRoot: false,
            children: []
          },
          {
            id: '8',
            title: '前端开发',
            description: '实现用户界面和交互逻辑',
            parentId: '4',
            x: 150,
            y: -250,
            isRoot: false,
            children: []
          },
          {
            id: '9',
            title: '后端开发',
            description: '实现业务逻辑和数据存储',
            parentId: '4',
            x: 450,
            y: -250,
            isRoot: false,
            children: []
          }
        ],
        connections: []
      }
    },
    
    // 创建新的思维导图
    createNewMindmap() {
      const rootNode = {
        id: Date.now().toString(),
        title: '中心主题',
        description: '',
        parentId: null,
        x: 0,
        y: 0,
        isRoot: true,
        children: []
      }
      
      this.mindmapData = {
        id: Date.now().toString(),
        title: '我的思维导图',
        nodes: [rootNode],
        connections: []
      }
      
      this.selectedNode = rootNode.id
    },
    
    // 获取节点样式
    getNodeStyle(node) {
      return {
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        zIndex: this.selectedNode === node.id ? 10 : 1
      }
    },
    
    // 选择节点
    selectNode(nodeId) {
      this.selectedNode = nodeId
    },
    
    // 开始拖拽节点
    startDragging(nodeId, event) {
      event.stopPropagation()
      this.isDragging = true
      this.draggedNodeId = nodeId
      
      const node = this.mindmapData.nodes.find(n => n.id === nodeId)
      if (node) {
        this.dragOffset.x = event.clientX - node.x
        this.dragOffset.y = event.clientY - node.y
      }
    },
    
    // 处理鼠标移动
    handleMouseMove(event) {
      // 拖拽节点
      if (this.isDragging && this.draggedNodeId) {
        const nodeIndex = this.mindmapData.nodes.findIndex(n => n.id === this.draggedNodeId)
        if (nodeIndex !== -1) {
          this.mindmapData.nodes[nodeIndex].x = event.clientX - this.dragOffset.x
          this.mindmapData.nodes[nodeIndex].y = event.clientY - this.dragOffset.y
        }
      }
      
      // 拖拽画布
      if (this.isDraggingCanvas) {
        this.translateX += event.clientX - this.canvasDragStart.x
        this.translateY += event.clientY - this.canvasDragStart.y
        this.canvasDragStart.x = event.clientX
        this.canvasDragStart.y = event.clientY
      }
    },
    
    // 处理鼠标松开
    handleMouseUp() {
      this.isDragging = false
      this.draggedNodeId = null
      this.isDraggingCanvas = false
    },
    
    // 处理鼠标滚轮事件（缩放）
    handleWheel(event) {
      event.preventDefault()
      const delta = event.deltaY > 0 ? -0.1 : 0.1
      const newScale = Math.max(0.5, Math.min(3, this.scale + delta))
      
      // 以鼠标位置为中心进行缩放
      const rect = this.$refs.mindmapCanvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      
      this.translateX = mouseX - (mouseX - this.translateX) * newScale / this.scale
      this.translateY = mouseY - (mouseY - this.translateY) * newScale / this.scale
      this.scale = newScale
    },
    
    // 添加节点
    addNode() {
      if (!this.selectedNode) {
        // 如果没有选中节点，创建根节点
        this.createNewMindmap()
        return
      }
      
      // 设置当前节点为新节点
      this.currentNode = {
        id: Date.now().toString(),
        title: '',
        description: '',
        parentId: this.selectedNode,
        x: 0,
        y: 0,
        isRoot: false
      }
      
      // 查找选中的父节点，设置新节点的位置
      const parentNode = this.mindmapData.nodes.find(n => n.id === this.selectedNode)
      if (parentNode) {
        // 计算新节点的位置（在父节点的右侧或下方）
        const siblingCount = parentNode.children.length
        this.currentNode.x = parentNode.x + 200
        this.currentNode.y = parentNode.y - 50 + siblingCount * 100
      }
      
      this.isEditingNode = false
      this.showNodeModal = true
    },
    
    // 编辑节点
    editNode() {
      if (!this.selectedNode) return
      
      // 查找选中的节点
      const node = this.mindmapData.nodes.find(n => n.id === this.selectedNode)
      if (node) {
        // 复制节点数据到当前节点
        this.currentNode = {
          ...node
        }
        this.isEditingNode = true
        this.showNodeModal = true
      }
    },
    
    // 删除节点
    deleteSelectedNode() {
      if (!this.selectedNode) return
      
      // 查找要删除的节点
      const nodeIndex = this.mindmapData.nodes.findIndex(n => n.id === this.selectedNode)
      if (nodeIndex !== -1) {
        const node = this.mindmapData.nodes[nodeIndex]
        
        // 如果有子节点，先删除所有子节点
        if (node.children && node.children.length > 0) {
          // 递归删除子节点
          this.deleteNodeAndChildren(node.id)
        }
        
        // 从父节点的children数组中移除该节点
        if (node.parentId) {
          const parentNode = this.mindmapData.nodes.find(n => n.id === node.parentId)
          if (parentNode && parentNode.children) {
            parentNode.children = parentNode.children.filter(childId => childId !== node.id)
          }
        }
        
        // 从nodes数组中移除该节点
        this.mindmapData.nodes.splice(nodeIndex, 1)
        this.selectedNode = null
      }
    },
    
    // 递归删除节点及其子节点
    deleteNodeAndChildren(nodeId) {
      const node = this.mindmapData.nodes.find(n => n.id === nodeId)
      if (node && node.children && node.children.length > 0) {
        // 先删除所有子节点
        node.children.forEach(childId => {
          this.deleteNodeAndChildren(childId)
        })
      }
      
      // 删除当前节点
      const nodeIndex = this.mindmapData.nodes.findIndex(n => n.id === nodeId)
      if (nodeIndex !== -1) {
        this.mindmapData.nodes.splice(nodeIndex, 1)
      }
    },
    
    // 保存节点
    saveNode() {
      if (!this.currentNode.title.trim()) {
        alert('请输入节点标题')
        return
      }
      
      if (this.isEditingNode) {
        // 编辑现有节点
        const nodeIndex = this.mindmapData.nodes.findIndex(n => n.id === this.currentNode.id)
        if (nodeIndex !== -1) {
          this.mindmapData.nodes[nodeIndex] = { ...this.currentNode }
        }
      } else {
        // 添加新节点
        this.mindmapData.nodes.push(this.currentNode)
        
        // 将新节点添加到父节点的children数组中
        if (this.currentNode.parentId) {
          const parentNode = this.mindmapData.nodes.find(n => n.id === this.currentNode.parentId)
          if (parentNode) {
            if (!parentNode.children) {
              parentNode.children = []
            }
            parentNode.children.push(this.currentNode.id)
          }
        }
        
        // 选中新创建的节点
        this.selectedNode = this.currentNode.id
      }
      
      this.closeNodeModal()
    },
    
    // 关闭节点弹窗
    closeNodeModal() {
      this.showNodeModal = false
      this.isEditingNode = false
      this.currentNode = {
        id: null,
        title: '',
        description: '',
        parentId: null,
        x: 0,
        y: 0,
        isRoot: false
      }
    },
    
    // 缩放相关方法
    zoomIn() {
      this.scale = Math.min(3, this.scale + 0.1)
    },
    
    zoomOut() {
      this.scale = Math.max(0.5, this.scale - 0.1)
    },
    
    resetZoom() {
      this.scale = 1
      this.translateX = 0
      this.translateY = 0
    },
    
    // 保存思维导图
    saveMindmap() {
      console.log('保存思维导图:', this.mindmapData)
      // 这里应该实现保存到服务器或本地的功能
      alert('思维导图已保存')
    },
    
    // 导出思维导图
    exportMindmap() {
      console.log('导出思维导图:', this.mindmapData)
      // 这里应该实现导出功能，例如导出为图片或JSON
      alert('思维导图导出功能将在后续版本实现')
    },
    
    // 重置思维导图
    resetMindmap() {
      if (confirm('确定要重置当前思维导图吗？这将丢失所有未保存的更改。')) {
        this.loadMockData()
        this.resetZoom()
        this.selectedNode = null
      }
    }
  }
}
</script>

<style scoped>
.mindmap-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.mindmap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.mindmap-header h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0;
}

.mindmap-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
}

.mindmap-toolbar {
  display: flex;
  gap: 10px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.toolbar-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-separator {
  width: 1px;
  background: #e2e8f0;
  margin: 0 5px;
}

.mindmap-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
}

.mindmap-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(45deg, #f0f2f5 25%, transparent 25%), 
              linear-gradient(-45deg, #f0f2f5 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f0f2f5 75%), 
              linear-gradient(-45deg, transparent 75%, #f0f2f5 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  cursor: grab;
}

.mindmap-canvas:active {
  cursor: grabbing;
}

.mindmap-wrapper {
  position: absolute;
  transform-origin: center;
  transition: transform 0.2s ease;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(1);
}

.mindmap-node {
  background: white;
  border: 2px solid #3498db;
  border-radius: 12px;
  padding: 15px;
  min-width: 150px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  position: absolute;
  z-index: 1;
  user-select: none;
}

.mindmap-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #2980b9;
}

.mindmap-node.selected {
  border-color: #e74c3c;
  box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
  z-index: 10;
}

.mindmap-node.root-node {
  background: #3498db;
  color: white;
  border-color: #2980b9;
}

.mindmap-node.root-node:hover {
  background: #2980b9;
}

.node-content {
  text-align: center;
}

.node-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.node-description {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
}

.root-node .node-description {
  color: rgba(255, 255, 255, 0.8);
}

.connection-line {
  position: absolute;
  background: #95a5a6;
  height: 2px;
  z-index: 0;
  transform-origin: left center;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #ecf0f1;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.node-input,
.node-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #bdc3c7;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.node-input:focus,
.node-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.node-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #ecf0f1;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #ecf0f1;
  color: #2c3e50;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background-color: #bdc3c7;
}

.confirm-btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-btn:hover {
  background-color: #2980b9;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 20px;
}

.create-mindmap-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-mindmap-btn:hover {
  background: #2980b9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mindmap-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .mindmap-controls {
    justify-content: center;
  }
  
  .mindmap-toolbar {
    flex-wrap: wrap;
  }
  
  .mindmap-node {
    min-width: 120px;
    padding: 10px;
  }
  
  .node-title {
    font-size: 14px;
  }
  
  .node-description {
    font-size: 11px;
  }
  
  .modal {
    width: 95%;
    margin: 20px;
  }
}
</style>