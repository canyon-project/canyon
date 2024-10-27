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
