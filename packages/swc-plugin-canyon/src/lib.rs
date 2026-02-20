//! # canyon
//!
//! 一个简单的 Rust 库，提供了一个 `add` 函数。

/// Adds two numbers together.
///
/// # Arguments
///
/// * `a` - 第一个数字
/// * `b` - 第二个数字
///
/// # Returns
///
/// 返回两个数字的和
///
/// # Examples
///
/// ```
/// use canyon::add;
///
/// assert_eq!(add(2, 3), 5);
/// assert_eq!(add(10, 20), 30);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(0, 0), 0);
        assert_eq!(add(-1, 1), 0);
        assert_eq!(add(100, 200), 300);
    }
}
