import copy
import json

def merge_file_coverage(first, second):
    ret = copy.deepcopy(first)
    ret.pop('l', None)  # 移除派生信息

    for key in second['s']:
        ret['s'][key] += second['s'][key]

    for key in second['f']:
        ret['f'][key] += second['f'][key]

    for key in second['b']:
        ret_array = ret['b'][key]
        second_array = second['b'][key]
        for i in range(len(ret_array)):
            ret_array[i] += second_array[i]

    return ret

def merge_coverage(first, second):
    if not second:
        return first

    merged_coverage = copy.deepcopy(first)  # 深拷贝 coverage，这样修改出来的是两个的合集
    for file_path, added in second.items():
        original = first.get(file_path)
        if original:
            result = merge_file_coverage(original, added)
        else:
            result = added
        merged_coverage[file_path] = result

    return merged_coverage


with open("./data/first.json",'r') as load_f:
    first_load_dict = json.load(load_f)

with open("./data/second.json",'r') as load_f:
    second_load_dict = json.load(load_f)

print(first_load_dict["/builds/canyon/canyon-demo/src/pages/Home.tsx"]['s'])
print(merge_coverage(first_load_dict,second_load_dict)["/builds/canyon/canyon-demo/src/pages/Home.tsx"]['s'])

# 期望
# {'0': 1, '1': 1, '2': 0, '3': 1, '4': 1, '5': 1, '6': 0, '7': 0, '8': 0, '9': 0}
# {'0': 2, '1': 2, '2': 0, '3': 2, '4': 2, '5': 2, '6': 0, '7': 0, '8': 0, '9': 0}
