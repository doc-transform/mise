# Mise + C++ 实践手册

以下是使用 mise 管理 C++ 项目的一些技巧。

## 使用 CMake 的 C++ 项目

```toml [mise.toml]
min_version = "2024.9.5"

[env]
# 项目信息
PROJECT_NAME = "{{ config_root | basename }}"

# 构建目录
BUILD_DIR = "{{ config_root }}/build"

[tools]
# 安装 CMake 和 make
cmake = "latest"
make = "latest"

[tasks.configure]
description = "配置项目"
run = "mkdir -p $BUILD_DIR && cd $BUILD_DIR && cmake .."

[tasks.build]
description = "构建项目"
alias = "b"
run = "cd $BUILD_DIR && make"

[tasks.clean]
description = "清理构建目录"
alias = "c"
run = "rm -rf $BUILD_DIR"

[tasks.run]
alias = "r"
description = "运行应用"
run = "$BUILD_DIR/bin/$PROJECT_NAME"

[tasks.info]
description = "打印项目信息"
run = '''
echo "Project: $PROJECT_NAME"
echo "Build Directory: $BUILD_DIR"
'''
```
