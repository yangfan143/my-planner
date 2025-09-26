const fs = require('fs');
const path = require('path');

// 读取Calendar.vue文件
const vueFilePath = path.join(__dirname, 'src', 'renderer', 'views', 'Calendar.vue');
const fileContent = fs.readFileSync(vueFilePath, 'utf8');

// 提取script部分
const scriptMatch = fileContent.match(/<script[^>]*>([\s\S]*)<\/script>/);

if (scriptMatch && scriptMatch[1]) {
    const scriptContent = scriptMatch[1];
    
    console.log('成功提取script部分');
    console.log('====================');
    
    // 我们将采用更简单的方法：检查函数定义的语法完整性
    // 查找所有的方法定义，检查它们的语法结构
    const methodMatches = scriptContent.match(/\w+\s*\(.*?\)\s*{/g);
    
    if (methodMatches) {
        console.log(`找到 ${methodMatches.length} 个方法定义`);
        
        // 检查fetchNoteAndNavigate方法和getMockEvents方法
        const methodsToCheck = ['fetchNoteAndNavigate', 'getMockEvents', 'createNewPlan'];
        let allMethodsValid = true;
        
        for (const methodName of methodsToCheck) {
            const methodMatch = scriptContent.match(new RegExp(`${methodName}\s*\(.*?\)\s*{[\s\S]*?}`));
            if (methodMatch) {
                console.log(`✓ 找到 ${methodName} 方法定义`);
            } else {
                console.error(`✗ 找不到完整的 ${methodName} 方法定义，可能存在语法问题`);
                allMethodsValid = false;
            }
        }
        
        if (allMethodsValid) {
            console.log('\n✓ 语法检查完成！所有关键方法的定义看起来是完整的。');
            console.log('注意：这只是一个简单的检查，不能替代实际的编译测试。');
        }
    } else {
        console.error('未找到任何方法定义');
    }
} else {
    console.error('无法提取Vue文件中的script部分');
}