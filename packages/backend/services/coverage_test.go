package services

import (
	"encoding/json"
	"reflect"
	"testing"

	"backend/models"
)

func TestGetBranchTypeByIndex(t *testing.T) {
	s := NewCoverageService()
	cases := map[uint8]string{
		0:   "unknown",
		1:   "if",
		2:   "binary-expr",
		3:   "cond-expr",
		4:   "switch",
		5:   "default-arg",
		255: "unknown",
	}
	for in, want := range cases {
		if got := s.getBranchTypeByIndex(in); got != want {
			t.Fatalf("getBranchTypeByIndex(%d) = %q, want %q", in, got, want)
		}
	}
}

func TestConvertZeroToNull(t *testing.T) {
	s := NewCoverageService()
	if got := s.convertZeroToNull(0); got != nil {
		t.Fatalf("convertZeroToNull(0) = %#v, want nil", got)
	}
	if got := s.convertZeroToNull(42); got != uint32(42) {
		t.Fatalf("convertZeroToNull(42) = %#v, want 42", got)
	}
}

func TestConvertTupleSliceToUint32Map(t *testing.T) {
	s := NewCoverageService()

	// case 1: valid []uint32 keys + []uint64 values
	in1 := []interface{}{[]uint32{1, 2, 3}, []uint64{10, 20, 30}}
	want1 := map[uint32]uint32{1: 10, 2: 20, 3: 30}
	if got := s.convertTupleSliceToUint32Map(in1); !reflect.DeepEqual(got, want1) {
		t.Fatalf("case1: got %v, want %v", got, want1)
	}

	// case 2: []interface{} keys + []interface{} values (mixed numeric types)
	in2 := []interface{}{[]interface{}{uint32(5), uint32(6)}, []interface{}{uint64(7), int(8)}}
	want2 := map[uint32]uint32{5: 7, 6: 8}
	if got := s.convertTupleSliceToUint32Map(in2); !reflect.DeepEqual(got, want2) {
		t.Fatalf("case2: got %v, want %v", got, want2)
	}

	// case 3: mismatched lengths -> truncated to min length
	in3 := []interface{}{[]uint32{1, 2, 3}, []uint64{9}}
	want3 := map[uint32]uint32{1: 9}
	if got := s.convertTupleSliceToUint32Map(in3); !reflect.DeepEqual(got, want3) {
		t.Fatalf("case3: got %v, want %v", got, want3)
	}

	// case 4: invalid input length -> empty map
	in4 := []interface{}{[]uint32{1, 2, 3}}
	want4 := map[uint32]uint32{}
	if got := s.convertTupleSliceToUint32Map(in4); !reflect.DeepEqual(got, want4) {
		t.Fatalf("case4: got %v, want %v", got, want4)
	}
}

func TestOrderedMapMarshalJSON(t *testing.T) {
	om := OrderedMap{
		Keys:   []string{"2", "10", "1"},
		Values: map[string]uint32{"1": 100, "2": 20, "10": 3},
	}
	b, err := om.MarshalJSON()
	if err != nil {
		t.Fatalf("MarshalJSON error: %v", err)
	}
	// numeric order should be 1,2,10
	got := string(b)
	want := "{\"1\":100,\"2\":20,\"10\":3}"
	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestOrderedInterfaceMapMarshalJSON(t *testing.T) {
	oim := OrderedInterfaceMap{
		Keys:   []string{"3", "1", "2"},
		Values: map[string]interface{}{"1": 1, "2": []int{2, 2}, "3": "x"},
	}
	b, err := oim.MarshalJSON()
	if err != nil {
		t.Fatalf("MarshalJSON error: %v", err)
	}
	got := string(b)
	// numeric order should be 1,2,3; arrays/strings have deterministic JSON
	want := "{\"1\":1,\"2\":[2,2],\"3\":\"x\"}"
	if got != want {
		t.Fatalf("got %q, want %q", got, want)
	}
}

func TestBuildOrderedHitMap(t *testing.T) {
	s := NewCoverageService()
	mapData := map[uint32]models.FunctionInfo{
		3: {Name: "f3"},
		1: {Name: "f1"},
	}
	hit := map[uint32]uint32{1: 10}
	om := s.buildOrderedHitMap(mapData, hit)
	wantKeys := []string{"1", "3"}
	if !reflect.DeepEqual(om.Keys, wantKeys) {
		t.Fatalf("keys = %v, want %v", om.Keys, wantKeys)
	}
	wantVals := map[string]uint32{"1": 10, "3": 0}
	if !reflect.DeepEqual(om.Values, wantVals) {
		t.Fatalf("values = %v, want %v", om.Values, wantVals)
	}
}

func TestDecodeKeyAndBuildOrderedBranchHitMap(t *testing.T) {
	s := NewCoverageService()
	// branch 0 has 2 paths; branch 1 has 0 paths (default to 2)
	branchMap := map[uint32]models.BranchInfo{
		0: {Paths: [][4]uint32{{1, 1, 1, 1}, {2, 2, 2, 2}}},
		1: {Paths: nil},
	}
	// encoded as branchId*10000 + branchLength
	hit := map[uint32]uint32{
		0*10000 + 0: 5,
		0*10000 + 1: 7,
		1*10000 + 0: 3,
	}
	oim := s.buildOrderedBranchHitMap(branchMap, hit)
	wantKeys := []string{"0", "1"}
	if !reflect.DeepEqual(oim.Keys, wantKeys) {
		t.Fatalf("keys = %v, want %v", oim.Keys, wantKeys)
	}
	v0 := oim.Values["0"].([]uint32)
	v1 := oim.Values["1"].([]uint32)
	if !reflect.DeepEqual(v0, []uint32{5, 7}) {
		t.Fatalf("values[0] = %v, want %v", v0, []uint32{5, 7})
	}
	if !reflect.DeepEqual(v1, []uint32{3, 0}) {
		t.Fatalf("values[1] = %v, want %v", v1, []uint32{3, 0})
	}
}

func TestRemoveCoverageInstrumentCwd(t *testing.T) {
	s := NewCoverageService()
	in := map[string]interface{}{
		"/root/proj/a/b.js": map[string]interface{}{"path": "old"},
		"/root/proj/x.go":   123,
	}
	out := s.removeCoverageInstrumentCwd(in, "/root/proj")
	if _, ok := out["a/b.js"]; !ok {
		t.Fatalf("expected key 'a/b.js' in result")
	}
	if _, ok := out["x.go"]; !ok {
		t.Fatalf("expected key 'x.go' in result")
	}
	// path field updated
	cov := out["a/b.js"].(map[string]interface{})
	if cov["path"].(string) != "a/b.js" {
		t.Fatalf("path not updated: %v", cov["path"])
	}
}

func TestFilterCoverageHit(t *testing.T) {
	s := NewCoverageService()
	coverages := []models.Coverage{{ID: "a"}, {ID: "b"}}
	hits := []models.CoverageHitSummaryResult{{CoverageID: "a"}, {CoverageID: "c"}}
	got := s.filterCoverageHit(coverages, hits)
	want := []models.CoverageHitSummaryResult{{CoverageID: "a"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestExtractKeysHelpers(t *testing.T) {
	s := NewCoverageService()
	// Statement map keys
	stmt := map[uint32]models.StatementInfo{10: {}, 2: {}}
	if got, want := s.extractKeysFromStatementMap(stmt), []uint32{10, 2}; !sameUint32Set(got, want) {
		t.Fatalf("stmt keys got %v, want set %v", got, want)
	}
	// Function map keys
	fn := map[uint32][]interface{}{7: {}, 1: {}}
	if got, want := s.extractKeysFromFunctionMap(fn), []uint32{7, 1}; !sameUint32Set(got, want) {
		t.Fatalf("fn keys got %v, want set %v", got, want)
	}
	// Branch map keys
	br := map[uint32][]interface{}{8: {}, 3: {}}
	if got, want := s.extractKeysFromBranchMap(br), []uint32{8, 3}; !sameUint32Set(got, want) {
		t.Fatalf("branch keys got %v, want set %v", got, want)
	}
}

func TestExtractKeysFromStringParsers(t *testing.T) {
	s := NewCoverageService()
	fnStr := "{1:('f',10,(1,2,3,4),(5,6,7,8)),3:('g',20,(2,2,2,2),(3,3,3,3))}"
	gotFn := s.extractKeysFromFunctionMapString(fnStr)
	if !sameUint32Set(gotFn, []uint32{1, 3}) {
		t.Fatalf("fnStr keys got %v, want [1,3]", gotFn)
	}
	brStr := "{2:(1,123,(1,2,3,4),[(5,6,7,8)]),5:(4,456,(2,3,4,5),[(1,1,1,1),(2,2,2,2)])}"
	gotBr := s.extractKeysFromBranchMapString(brStr)
	if !sameUint32Set(gotBr, []uint32{2, 5}) {
		t.Fatalf("brStr keys got %v, want [2,5]", gotBr)
	}
}

func TestConvertInterfaceSliceToUint32Slice(t *testing.T) {
	s := NewCoverageService()
	in := []interface{}{uint32(1), uint64(2), int(3), int64(4), "ignored"}
	got := s.convertInterfaceSliceToUint32Slice(in)
	want := []uint32{1, 2, 3, 4}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestDeduplicateHashIDList(t *testing.T) {
	s := NewCoverageService()
	relations := []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}{
		{CoverageMapHashID: "h1", FullFilePath: "a"},
		{CoverageMapHashID: "h2", FullFilePath: "b"},
		{CoverageMapHashID: "h1", FullFilePath: "c"},
	}
	got := s.deduplicateHashIDList(relations)
	// order should preserve first-seen
	want := []string{"h1", "h2"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

func TestMergeCoverageMapWithFilePath(t *testing.T) {
	s := NewCoverageService()
	relations := []struct {
		CoverageMapHashID string `gorm:"column:coverage_map_hash_id"`
		FullFilePath      string `gorm:"column:full_file_path"`
	}{
		{CoverageMapHashID: "h1", FullFilePath: "p1"},
		{CoverageMapHashID: "h2", FullFilePath: "p2"},
	}
	data := []models.CoverageMapSummaryResult{
		{Hash: "h1", S: []uint32{1}, F: []uint32{2}, B: []uint32{3}},
		{Hash: "hx", S: []uint32{0}},
	}
	got := s.mergeCoverageMapWithFilePath(relations, data)
	if len(got) != 1 {
		t.Fatalf("got len %d, want 1", len(got))
	}
	if got[0].Hash != "h1" || got[0].FullFilePath != "p1" {
		t.Fatalf("unexpected result: %+v", got[0])
	}
}

func TestDeduplicateBuildGroupList(t *testing.T) {
	s := NewCoverageService()
	in := []map[string]string{
		{"buildProvider": "gitlab", "buildID": "1"},
		{"buildProvider": "gitlab", "buildID": "1"},
		{"buildProvider": "github", "buildID": "2"},
	}
	got := s.deduplicateBuildGroupList(in)
	want := []map[string]string{
		{"buildProvider": "gitlab", "buildID": "1"},
		{"buildProvider": "github", "buildID": "2"},
	}
	if !equalStrMapSlices(got, want) {
		bGot, _ := json.Marshal(got)
		bWant, _ := json.Marshal(want)
		t.Fatalf("got %s, want %s", string(bGot), string(bWant))
	}
}

func TestInitializeHitsHelpers(t *testing.T) {
	s := NewCoverageService()
	stmtMap := map[string]interface{}{"1": nil, "2": nil}
	fnMap := map[string]interface{}{"3": nil}
	branchMap := map[string]interface{}{
		"12": map[string]interface{}{"locations": []map[string]interface{}{{}, {}}},
	}

	sHits := s.initializeStatementHits(stmtMap)
	if !reflect.DeepEqual(sHits, map[string]uint32{"1": 0, "2": 0}) {
		t.Fatalf("stmt hits got %v", sHits)
	}
	fHits := s.initializeFunctionHits(fnMap)
	if !reflect.DeepEqual(fHits, map[string]uint32{"3": 0}) {
		t.Fatalf("fn hits got %v", fHits)
	}
	bHits := s.initializeBranchHits(branchMap)
	if len(bHits) != 1 || !reflect.DeepEqual(bHits["12"], []uint32{0, 0}) {
		t.Fatalf("branch hits got %v", bHits)
	}
}

func TestConvertBranchHits(t *testing.T) {
	s := NewCoverageService()
	branchMap := map[string]interface{}{
		"12": map[string]interface{}{
			"locations": []map[string]interface{}{{}, {}},
		},
	}
	hits := map[uint32]uint32{12: 9}
	got := s.convertBranchHits(hits, branchMap)
	want := map[string]interface{}{"12": []uint32{9, 0}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %v, want %v", got, want)
	}
}

// helpers
func sameUint32Set(a, b []uint32) bool {
	if len(a) != len(b) {
		return false
	}
	ma := make(map[uint32]int)
	for _, v := range a {
		ma[v]++
	}
	for _, v := range b {
		if ma[v] == 0 {
			return false
		}
		ma[v]--
		if ma[v] == 0 {
			delete(ma, v)
		}
	}
	return len(ma) == 0
}

func equalStrMapSlices(a, b []map[string]string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if !reflect.DeepEqual(a[i], b[i]) {
			return false
		}
	}
	return true
}
