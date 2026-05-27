const fs = require('fs');
let code = fs.readFileSync('assets/js/script.js', 'utf8');
const startStr = 'const data = {';
const endStr = 'allProducts = data.products || []; // Dùng trực tiếp dữ liệu tĩnh';
const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf(endStr);
if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Network response was not ok');
        const resData = await response.json();
        const data = resData.products;
        allProducts = data.products || [];`;
    code = code.substring(0, startIdx) + replacement + code.substring(endIdx + endStr.length);
    fs.writeFileSync('assets/js/script.js', code);
    console.log("Refactored script.js fetch logic");
} else {
    console.log("Could not find start or end index");
}
