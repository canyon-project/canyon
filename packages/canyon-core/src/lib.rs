use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn percent(covered: f64, total: f64) -> f64 {
    if total > 0.0 {
        let tmp = (1000.0 * 100.0 * covered) / total;
        (tmp / 10.0).floor() / 100.0
    } else {
        100.0
    }
}

// 测试
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_percent() {
        assert_eq!(percent(0.0, 0.0), 100.0);
        assert_eq!(percent(0.0, 1.0), 0.0);
        assert_eq!(percent(1.0, 1.0), 100.0);
        assert_eq!(percent(1.0, 2.0), 50.0);
        assert_eq!(percent(2.0, 1.0), 200.0);
    }
}