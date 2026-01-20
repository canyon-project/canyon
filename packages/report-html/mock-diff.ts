export const mockDiff = `diff --git a/fixtures/sum.js b/fixtures/sum.js
index 1234567..abcdefg 100644
--- a/fixtures/sum.js
+++ b/fixtures/sum.js
@@ -1,3 +1,5 @@
 export function sum(a, b) {
+  // 新增的注释
   return a + b;
+  // 另一个新增的注释
 }
diff --git a/fixtures/add.js b/fixtures/add.js
index 1234567..abcdefg 100644
--- a/fixtures/add.js
+++ b/fixtures/add.js
@@ -1,3 +1,6 @@
 export function sum(a, b) {
+  // 新增的注释行
+  console.log('计算中...');
   return a + b;
+  // 结束注释
 }`
