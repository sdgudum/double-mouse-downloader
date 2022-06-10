# 调试指南

这篇指南介绍了如何优雅地调试电子垃圾（Electron）。

## 调试 Electron 主进程（`src/app`）

主进程使用 VSCode 进行调试。

首先在 Terminal 运行 `npm run prepare-debug`，准备好调试环境。

该命令主要做了两件事情：

1. 监控 `src/app` 下的文件变化并进行自动编译（会生成 sourceMap 给调试工具用）。
2. 启动 Vite 开发服务器，用于视图调试。

然后在 `src/app` 下的任意代码打上断点后，按 F5 启动 VSCode 的调试工具，启动配置已经在 `.vscode/launch.json` 配置好。

正常情况下代码断点调试应该就能正常使用了。

## 调试视图（`src/views`）

视图使用 Vite 进行调试。主要有两种调试方法：

### 一、同时调试 Electron 主进程和视图

这种方法首先需要运行 `npm run prepare-debug`，调试主进程的方法同上面说的一样。

启动主进程后，直接修改 `src/views` 下面的文件即可实时看到变化，使用 `Ctrl + Shift + i` 来打开开发者工具。

### 二、仅调试视图

使用命令 `npm start`，待主程序启动后使用 `Ctrl + Shift + i` 来打开开发者工具即可调试。
