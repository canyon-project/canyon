package main

import (
	"encoding/json"
	"reflect"
	"testing"
	"strings"
	"fmt"
	"time"
)

func TestCanonicalizeSnippet(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "empty string",
			input:    "",
			expected: "",
		},
		{
			name:     "no whitespace",
			input:    "hello",
			expected: "hello",
		},
		{
			name:     "spaces only",
			input:    "   ",
			expected: "",
		},
		{
			name:     "simple spaces",
			input:    "hello world",
			expected: "helloworld",
		},
		{
			name:     "tabs and spaces",
			input:    "hello\t\tworld  test",
			expected: "helloworldtest",
		},
		{
			name:     "newlines",
			input:    "line1\nline2\nline3",
			expected: "line1line2line3",
		},
		{
			name:     "mixed whitespace",
			input:    " \t\nhello\n\t world \r\n test \t",
			expected: "helloworldtest",
		},
		{
			name:     "javascript function",
			input:    "function test() {\n  return true;\n}",
			expected: "functiontest(){returntrue;}",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := canonicalizeSnippet(tt.input)
			if result != tt.expected {
				t.Errorf("canonicalizeSnippet(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestSha1Hex(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "empty string",
			input:    "",
			expected: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
		},
		{
			name:     "hello world",
			input:    "hello world",
			expected: "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed",
		},
		{
			name:     "abc",
			input:    "abc",
			expected: "a9993e364706816aba3e25717850c26c9cd0d89d",
		},
		{
			name:     "function code",
			input:    "functiontest(){returntrue;}",
			expected: "0ba3a930b58996a70dce04843dec24c481ba95f7",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := sha1Hex(tt.input)
			if result != tt.expected {
				t.Errorf("sha1Hex(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestComputeLineStarts(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []int
	}{
		{
			name:     "empty string",
			input:    "",
			expected: []int{0},
		},
		{
			name:     "single line",
			input:    "hello",
			expected: []int{0},
		},
		{
			name:     "two lines",
			input:    "hello\nworld",
			expected: []int{0, 6},
		},
		{
			name:     "multiple lines",
			input:    "line1\nline2\nline3",
			expected: []int{0, 6, 12},
		},
		{
			name:     "empty lines",
			input:    "\n\n\n",
			expected: []int{0, 1, 2, 3},
		},
		{
			name:     "lines with different lengths",
			input:    "a\nbb\nccc",
			expected: []int{0, 2, 5},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := computeLineStarts(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("computeLineStarts(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestPosToOffset(t *testing.T) {
	lineStarts := []int{0, 6, 12, 18} // "line1\nline2\nline3\n"

	tests := []struct {
		name       string
		pos        Position
		lineStarts []int
		expected   int
	}{
		{
			name:       "first line, first column",
			pos:        Position{Line: 1, Column: 0},
			lineStarts: lineStarts,
			expected:   0,
		},
		{
			name:       "first line, middle column",
			pos:        Position{Line: 1, Column: 3},
			lineStarts: lineStarts,
			expected:   3,
		},
		{
			name:       "second line, first column",
			pos:        Position{Line: 2, Column: 0},
			lineStarts: lineStarts,
			expected:   6,
		},
		{
			name:       "second line, middle column",
			pos:        Position{Line: 2, Column: 2},
			lineStarts: lineStarts,
			expected:   8,
		},
		{
			name:       "negative line",
			pos:        Position{Line: -1, Column: 5},
			lineStarts: lineStarts,
			expected:   5,
		},
		{
			name:       "line beyond range",
			pos:        Position{Line: 100, Column: 5},
			lineStarts: lineStarts,
			expected:   23, // lineStarts[3] + 5
		},
		{
			name:       "single line starts with zero",
			pos:        Position{Line: 1, Column: 5},
			lineStarts: []int{0},
			expected:   5,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := posToOffset(tt.pos, tt.lineStarts)
			if result != tt.expected {
				t.Errorf("posToOffset(%+v, %v) = %d, want %d", tt.pos, tt.lineStarts, result, tt.expected)
			}
		})
	}
}

func TestSliceByLoc(t *testing.T) {
	content := "line1\nline2\nline3"

	tests := []struct {
		name     string
		content  string
		loc      Loc
		expected string
	}{
		{
			name:    "single line slice",
			content: content,
			loc: Loc{
				Start: Position{Line: 1, Column: 0},
				End:   Position{Line: 1, Column: 5},
			},
			expected: "line1",
		},
		{
			name:    "cross line slice",
			content: content,
			loc: Loc{
				Start: Position{Line: 1, Column: 3},
				End:   Position{Line: 2, Column: 2},
			},
			expected: "e1\nli",
		},
		{
			name:    "full content",
			content: content,
			loc: Loc{
				Start: Position{Line: 1, Column: 0},
				End:   Position{Line: 3, Column: 5},
			},
			expected: "line1\nline2\nline3",
		},
		{
			name:    "invalid range (start > end)",
			content: content,
			loc: Loc{
				Start: Position{Line: 2, Column: 3},
				End:   Position{Line: 1, Column: 1},
			},
			expected: "",
		},
		{
			name:    "beyond content range",
			content: content,
			loc: Loc{
				Start: Position{Line: 1, Column: 0},
				End:   Position{Line: 10, Column: 100},
			},
			expected: content,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			starts := computeLineStarts(tt.content)
			result := sliceByLoc(tt.content, tt.loc, starts)
			if result != tt.expected {
				t.Errorf("sliceByLoc(%q, %+v) = %q, want %q", tt.content, tt.loc, result, tt.expected)
			}
		})
	}
}

func TestBuildFnHashToIds(t *testing.T) {
	tests := []struct {
		name     string
		entry    *FileCoverage
		content  string
		expected map[string][]string
	}{
		{
			name:     "nil entry",
			entry:    nil,
			content:  "",
			expected: map[string][]string{},
		},
		{
			name: "entry with nil FnMap",
			entry: &FileCoverage{
				Path:  "test.js",
				FnMap: nil,
			},
			content:  "",
			expected: map[string][]string{},
		},
		{
			name: "single function",
			entry: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 3, Column: 1},
						},
					},
				},
			},
			content: "function test() {\n  return true;\n}",
			expected: map[string][]string{
				sha1Hex(canonicalizeSnippet("function test() {\n  return true;\n}")): {"0"},
			},
		},
		{
			name: "multiple functions with same code",
			entry: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test1",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 2, Column: 1},
						},
					},
					"1": {
						Name: "test2",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 2, Column: 1},
						},
					},
				},
			},
			content: "a",
			expected: map[string][]string{
				sha1Hex(canonicalizeSnippet("a")): {"0", "1"},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := buildFnHashToIds(tt.entry, tt.content)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("buildFnHashToIds() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestMergeFunctionsByHash(t *testing.T) {
	tests := []struct {
		name         string
		base         *FileCoverage
		baseContent  string
		other        *FileCoverage
		otherContent string
		expected     map[string]int
	}{
		{
			name:         "nil base",
			base:         nil,
			baseContent:  "",
			other:        &FileCoverage{},
			otherContent: "",
			expected:     nil,
		},
		{
			name: "nil other",
			base: &FileCoverage{
				F: map[string]int{},
			},
			baseContent:  "",
			other:        nil,
			otherContent: "",
			expected:     map[string]int{},
		},
		{
			name: "matching functions",
			base: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 3, Column: 1},
						},
					},
				},
				F: map[string]int{"0": 5},
			},
			baseContent: "function test() {\n  return true;\n}",
			other: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 3, Column: 1},
						},
					},
				},
				F: map[string]int{"0": 3},
			},
			otherContent: "function test() {\n  return true;\n}",
			expected:     map[string]int{"0": 8}, // 5 + 3
		},
		{
			name: "multiple functions with same hash in other",
			base: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 2, Column: 1},
						},
					},
				},
				F: map[string]int{"0": 2},
			},
			baseContent: "a",
			other: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test1",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 2, Column: 1},
						},
					},
					"1": {
						Name: "test2",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 2, Column: 1},
						},
					},
				},
				F: map[string]int{"0": 3, "1": 7}, // max is 7
			},
			otherContent: "a",
			expected:     map[string]int{"0": 9}, // 2 + 7
		},
		{
			name: "no matching functions",
			base: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 2, Column: 1},
						},
					},
				},
				F: map[string]int{"0": 5},
			},
			baseContent: "a",
			other: &FileCoverage{
				Path: "test.js",
				FnMap: map[string]FnMapEntry{
					"0": {
						Name: "test",
						Loc: Loc{
							Start: Position{Line: 1, Column: 0},
							End:   Position{Line: 2, Column: 1},
						},
					},
				},
				F: map[string]int{"0": 3},
			},
			otherContent: "b", // different content, different hash
			expected:     map[string]int{"0": 5}, // unchanged
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mergeFunctionsByHash(tt.base, tt.baseContent, tt.other, tt.otherContent)
			
			if tt.base == nil {
				if tt.expected != nil {
					t.Errorf("expected base to remain nil")
				}
				return
			}
			
			if !reflect.DeepEqual(tt.base.F, tt.expected) {
				t.Errorf("after merge, base.F = %v, want %v", tt.base.F, tt.expected)
			}
		})
	}
}

// Integration test using the example data from main()
func TestIntegrationExample(t *testing.T) {
	pull2covB := `{"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0002/repo/src/b.js": {"path":"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0002/repo/src/b.js","statementMap":{"0":{"start":{"line":2,"column":2},"end":{"line":2,"column":15}},"1":{"start":{"line":6,"column":2},"end":{"line":6,"column":21}},"2":{"start":{"line":10,"column":2},"end":{"line":10,"column":35}}},"fnMap":{"0":{"name":"b1","decl":{"start":{"line":1,"column":16},"end":{"line":1,"column":18}},"loc":{"start":{"line":1,"column":22},"end":{"line":3,"column":1}}},"1":{"name":"b2","decl":{"start":{"line":5,"column":16},"end":{"line":5,"column":18}},"loc":{"start":{"line":5,"column":22},"end":{"line":7,"column":1}}},"2":{"name":"b3","decl":{"start":{"line":9,"column":16},"end":{"line":9,"column":18}},"loc":{"start":{"line":9,"column":24},"end":{"line":11,"column":1}}}},"branchMap":{},"s":{"0":1,"1":2,"2":1},"f":{"0":1,"1":2,"2":1},"b":{}}}`
	pull2codeB := `export function b1(x) {
  return x * 3;
}

export function b2(x) {
  return x % 2 === 0;
}

export function b3(str) {
  return String(str).toLowerCase();
}`

	pull4covB := `{"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0004/repo/src/b.js": {"path":"/Users/travzhang/github.com/canyon-project/canyon/playground/hard-merge/pulls/1/commits/0004/repo/src/b.js","statementMap":{"0":{"start":{"line":2,"column":2},"end":{"line":2,"column":15}},"1":{"start":{"line":6,"column":2},"end":{"line":6,"column":21}},"2":{"start":{"line":10,"column":2},"end":{"line":10,"column":35}}},"fnMap":{"0":{"name":"b1","decl":{"start":{"line":1,"column":16},"end":{"line":1,"column":18}},"loc":{"start":{"line":1,"column":22},"end":{"line":3,"column":1}}},"1":{"name":"b2","decl":{"start":{"line":5,"column":16},"end":{"line":5,"column":18}},"loc":{"start":{"line":5,"column":22},"end":{"line":7,"column":1}}},"2":{"name":"b3","decl":{"start":{"line":9,"column":16},"end":{"line":9,"column":18}},"loc":{"start":{"line":9,"column":24},"end":{"line":11,"column":1}}}},"branchMap":{},"s":{"0":1,"1":2,"2":1},"f":{"0":1,"1":2,"2":1},"b":{}}}`
	pull4codeB := `export function b1(x) {
  return x * 7;
}

export function b2(x) {
  return x % 2 === 0;
}

export function b3(str) {
  return String(str).toUpperCase();
}`

	// Parse JSON to coverage objects
	var cov2 map[string]*FileCoverage
	if err := json.Unmarshal([]byte(pull2covB), &cov2); err != nil {
		t.Fatalf("failed to unmarshal cov2: %v", err)
	}
	var cov4 map[string]*FileCoverage
	if err := json.Unmarshal([]byte(pull4covB), &cov4); err != nil {
		t.Fatalf("failed to unmarshal cov4: %v", err)
	}

	// Get the single file entries
	var entry2, entry4 *FileCoverage
	for _, v := range cov2 {
		entry2 = v
		break
	}
	for _, v := range cov4 {
		entry4 = v
		break
	}

	if entry2 == nil || entry4 == nil {
		t.Fatal("missing entries")
	}

	// Store original values for comparison
	originalF := make(map[string]int)
	for k, v := range entry4.F {
		originalF[k] = v
	}

	// Perform merge
	mergeFunctionsByHash(entry4, pull4codeB, entry2, pull2codeB)

	// Verify that only matching functions (b2) had their counts increased
	// b2 function should increase because it's identical in both versions
	// b1 and b3 functions should not increase because they have different implementations
	expectedChanges := map[string]bool{
		"0": false, // b1 - different implementations (x*3 vs x*7)
		"1": true,  // b2 - same implementation (x % 2 === 0)
		"2": false, // b3 - different implementations (toLowerCase vs toUpperCase)
	}
	
	for id, shouldIncrease := range expectedChanges {
		originalCount := originalF[id]
		newCount := entry4.F[id]
		
		if shouldIncrease {
			if newCount <= originalCount {
				t.Errorf("function %s count should have increased: %d -> %d", id, originalCount, newCount)
			}
		} else {
			if newCount != originalCount {
				t.Errorf("function %s count should not have changed: %d -> %d", id, originalCount, newCount)
			}
		}
	}

	// Test specific expected behavior
	// b2 function should have the same hash in both versions since it's identical
	// b1 and b3 functions should have different hashes due to different implementations
	
	// Verify that all functions have been processed
	expectedFunctions := []string{"0", "1", "2"}
	for _, id := range expectedFunctions {
		if _, exists := entry4.F[id]; !exists {
			t.Errorf("function %s missing after merge", id)
		}
	}
}

// Complex integration test with realistic functions
func TestComplexIntegrationExample(t *testing.T) {
	// More complex JavaScript functions with various scenarios
	complexCode1 := `export function complexCalculation(data, options) {
  if (!data || data.length === 0) {
    return { result: 0, error: 'No data provided' };
  }
  
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    if (typeof data[i] === 'number') {
      total += data[i] * (options?.multiplier || 1);
    }
  }
  
  return {
    result: total,
    average: total / data.length,
    processed: true
  };
}

export function formatString(input) {
  // Handle edge cases
  if (!input) return '';
  
  return input
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function asyncHandler(callback) {
  return async function(req, res, next) {
    try {
      await callback(req, res, next);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}`

	complexCode2 := `export function complexCalculation(data, options) {
  if (!data || data.length === 0) {
    return { result: 0, error: 'No data provided' };
  }
  
  let total = 0;
  for (let i = 0; i < data.length; i++) {
    if (typeof data[i] === 'number') {
      total += data[i] * (options?.multiplier || 2); // Different multiplier
    }
  }
  
  return {
    result: total,
    average: total / data.length,
    processed: true
  };
}

export function formatString(input) {
  // Handle edge cases
  if (!input) return '';
  
  return input
    .toString()
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function asyncHandler(callback) {
  return async function(req, res, next) {
    try {
      await callback(req, res, next);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}`

	// Create complex coverage data
	complexCov1 := &FileCoverage{
		Path: "complex.js",
		FnMap: map[string]FnMapEntry{
			"0": {
				Name: "complexCalculation",
				Loc: Loc{
					Start: Position{Line: 1, Column: 40},
					End:   Position{Line: 17, Column: 1},
				},
			},
			"1": {
				Name: "formatString",
				Loc: Loc{
					Start: Position{Line: 19, Column: 28},
					End:   Position{Line: 27, Column: 1},
				},
			},
			"2": {
				Name: "asyncHandler",
				Loc: Loc{
					Start: Position{Line: 29, Column: 27},
					End:   Position{Line: 37, Column: 1},
				},
			},
		},
		F: map[string]int{"0": 10, "1": 5, "2": 3},
	}

	complexCov2 := &FileCoverage{
		Path: "complex.js",
		FnMap: map[string]FnMapEntry{
			"0": {
				Name: "complexCalculation",
				Loc: Loc{
					Start: Position{Line: 1, Column: 40},
					End:   Position{Line: 17, Column: 1},
				},
			},
			"1": {
				Name: "formatString",
				Loc: Loc{
					Start: Position{Line: 19, Column: 28},
					End:   Position{Line: 27, Column: 1},
				},
			},
			"2": {
				Name: "asyncHandler",
				Loc: Loc{
					Start: Position{Line: 29, Column: 27},
					End:   Position{Line: 37, Column: 1},
				},
			},
		},
		F: map[string]int{"0": 7, "1": 8, "2": 2},
	}

	// Store original counts
	originalCounts := make(map[string]int)
	for k, v := range complexCov1.F {
		originalCounts[k] = v
	}

	// Perform merge
	mergeFunctionsByHash(complexCov1, complexCode1, complexCov2, complexCode2)

	// Verify results
	// formatString and asyncHandler should merge (identical)
	// complexCalculation should not merge (different multiplier)
	expectedResults := map[string]struct {
		shouldIncrease bool
		description    string
	}{
		"0": {false, "complexCalculation - different multiplier (1 vs 2)"},
		"1": {true, "formatString - identical implementation"},
		"2": {true, "asyncHandler - identical implementation"},
	}

	for id, expected := range expectedResults {
		original := originalCounts[id]
		final := complexCov1.F[id]

		if expected.shouldIncrease {
			if final <= original {
				t.Errorf("Function %s (%s) should have increased: %d -> %d", 
					id, expected.description, original, final)
			} else {
				t.Logf("✓ Function %s (%s) correctly increased: %d -> %d", 
					id, expected.description, original, final)
			}
		} else {
			if final != original {
				t.Errorf("Function %s (%s) should not have changed: %d -> %d", 
					id, expected.description, original, final)
			} else {
				t.Logf("✓ Function %s (%s) correctly unchanged: %d", 
					id, expected.description, final)
			}
		}
	}
}

// Test with functions containing special characters and edge cases
func TestSpecialCharactersAndEdgeCases(t *testing.T) {
	specialCode1 := `export function regexValidator(input) {
  const patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[1-9]\d{1,14}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  };
  
  // Test with various quotes and escape sequences
  const messages = {
    invalid: "Invalid format! Please check your input \"again\".",
    success: 'Validation passed! Welcome to our app\'s system.'
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(input)) {
      return { valid: true, type, message: messages.success };
    }
  }
  
  return { valid: false, message: messages.invalid };
}`

	specialCode2 := `export function regexValidator(input) {
  const patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^\+?[1-9]\d{1,14}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
  };
  
  // Test with various quotes and escape sequences  
  const messages = {
    invalid: "Invalid format! Please check your input \"again\".",
    success: 'Validation passed! Welcome to our app\'s system.'
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(input)) {
      return { valid: true, type, message: messages.success };
    }
  }
  
  return { valid: false, message: messages.invalid };
}`

	coverage1 := &FileCoverage{
		Path: "special.js",
		FnMap: map[string]FnMapEntry{
			"0": {
				Name: "regexValidator",
				Loc: Loc{
					Start: Position{Line: 1, Column: 32},
					End:   Position{Line: 20, Column: 1},
				},
			},
		},
		F: map[string]int{"0": 15},
	}

	coverage2 := &FileCoverage{
		Path: "special.js", 
		FnMap: map[string]FnMapEntry{
			"0": {
				Name: "regexValidator",
				Loc: Loc{
					Start: Position{Line: 1, Column: 32},
					End:   Position{Line: 20, Column: 1},
				},
			},
		},
		F: map[string]int{"0": 12},
	}

	originalCount := coverage1.F["0"]
	mergeFunctionsByHash(coverage1, specialCode1, coverage2, specialCode2)
	finalCount := coverage1.F["0"]

	// Should merge because functions are identical (only whitespace difference)
	if finalCount <= originalCount {
		t.Errorf("Special characters function should have merged: %d -> %d", originalCount, finalCount)
	} else {
		t.Logf("✓ Special characters function correctly merged: %d -> %d", originalCount, finalCount)
	}
}

// Test with many functions to verify performance and correctness at scale
func TestScaleTest(t *testing.T) {
	const numFunctions = 50
	
	// Generate code with many functions
	var code1, code2 strings.Builder
	fnMap1 := make(map[string]FnMapEntry)
	fnMap2 := make(map[string]FnMapEntry)
	f1 := make(map[string]int)
	f2 := make(map[string]int)
	
	for i := 0; i < numFunctions; i++ {
		id := fmt.Sprintf("%d", i)
		funcName := fmt.Sprintf("func%d", i)
		
		// Every 5th function will be identical, others will have small differences
		var body1, body2 string
		if i%5 == 0 {
			// Identical functions
			body1 = fmt.Sprintf("  return %d * x + 1;", i)
			body2 = body1
		} else {
			// Different functions
			body1 = fmt.Sprintf("  return %d * x + 1;", i)
			body2 = fmt.Sprintf("  return %d * x + 2;", i) // Different constant
		}
		
		func1 := fmt.Sprintf("export function %s(x) {\n%s\n}\n\n", funcName, body1)
		func2 := fmt.Sprintf("export function %s(x) {\n%s\n}\n\n", funcName, body2)
		
		code1.WriteString(func1)
		code2.WriteString(func2)
		
		startLine := i*4 + 1
		endLine := startLine + 2
		
		fnMap1[id] = FnMapEntry{
			Name: funcName,
			Loc: Loc{
				Start: Position{Line: startLine, Column: 23 + len(funcName)},
				End:   Position{Line: endLine, Column: 1},
			},
		}
		fnMap2[id] = fnMap1[id]
		
		f1[id] = i + 1
		f2[id] = i + 2
	}
	
	coverage1 := &FileCoverage{
		Path:  "scale.js",
		FnMap: fnMap1,
		F:     f1,
	}
	
	coverage2 := &FileCoverage{
		Path:  "scale.js",
		FnMap: fnMap2,
		F:     f2,
	}
	
	// Store original counts
	originalCounts := make(map[string]int)
	for k, v := range coverage1.F {
		originalCounts[k] = v
	}
	
	// Measure performance
	start := time.Now()
	mergeFunctionsByHash(coverage1, code1.String(), coverage2, code2.String())
	elapsed := time.Since(start)
	
	t.Logf("Scale test with %d functions completed in %v", numFunctions, elapsed)
	
	// Verify correctness
	mergedCount := 0
	unchangedCount := 0
	
	for i := 0; i < numFunctions; i++ {
		id := fmt.Sprintf("%d", i)
		original := originalCounts[id]
		final := coverage1.F[id]
		
		if i%5 == 0 {
			// Should have merged
			if final <= original {
				t.Errorf("Function %d should have merged but didn't: %d -> %d", i, original, final)
			} else {
				mergedCount++
			}
		} else {
			// Should not have merged
			if final != original {
				t.Errorf("Function %d should not have merged but did: %d -> %d", i, original, final)
			} else {
				unchangedCount++
			}
		}
	}
	
	expectedMerged := numFunctions / 5
	expectedUnchanged := numFunctions - expectedMerged
	
	if mergedCount != expectedMerged {
		t.Errorf("Expected %d merged functions, got %d", expectedMerged, mergedCount)
	}
	if unchangedCount != expectedUnchanged {
		t.Errorf("Expected %d unchanged functions, got %d", expectedUnchanged, unchangedCount)
	}
	
	t.Logf("✓ Scale test passed: %d merged, %d unchanged", mergedCount, unchangedCount)
}

// Benchmark tests
func BenchmarkCanonicalizeSnippet(b *testing.B) {
	input := `function complexFunction(a, b, c) {
		if (a > b) {
			return a * c + b;
		} else {
			return b * c + a;
		}
	}`
	
	for i := 0; i < b.N; i++ {
		canonicalizeSnippet(input)
	}
}

func BenchmarkSha1Hex(b *testing.B) {
	input := "functioncomplexFunction(a,b,c){if(a>b){returna*c+b;}else{returnb*c+a;}}"
	
	for i := 0; i < b.N; i++ {
		sha1Hex(input)
	}
}

func BenchmarkBuildFnHashToIds(b *testing.B) {
	entry := &FileCoverage{
		Path: "benchmark.js",
		FnMap: map[string]FnMapEntry{
			"0": {Name: "fn1", Loc: Loc{Start: Position{Line: 1, Column: 0}, End: Position{Line: 5, Column: 1}}},
			"1": {Name: "fn2", Loc: Loc{Start: Position{Line: 6, Column: 0}, End: Position{Line: 10, Column: 1}}},
			"2": {Name: "fn3", Loc: Loc{Start: Position{Line: 11, Column: 0}, End: Position{Line: 15, Column: 1}}},
		},
	}
	
	content := `function fn1() {
    return 1;
}

function fn2() {
    return 2;
}

function fn3() {
    return 3;
}`
	
	for i := 0; i < b.N; i++ {
		buildFnHashToIds(entry, content)
	}
} 