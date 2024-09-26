<template>
	<n-layout :class="['h-100vh', 'w-full']">
		<n-layout-header class="flex justify-between items-center h-64px">
			<n-h2 prefix="bar" class="m-0 ml-4 flex">
				<n-text type="primary">{{ activeTitle }}</n-text>
			</n-h2>
			<div>
				<n-tooltip placement="left" trigger="hover">
					<template #trigger>
						<span
							class="ml-2 mr-2 cursor-default"
							@click="isYearTimeShow = !isYearTimeShow"
							>{{ isYearTimeShow ? "今年" : "今天" }}剩余时间：
							<span class="color-orange text-12">{{
								isYearTimeShow
									? `${leftDays}`
									: `${hour > 9 ? hour : `0${hour}`}:${
											minute > 9 ? minute : `0${minute}`
									  }:${second > 9 ? second : `0${second}`}`
							}}</span
							>{{ isYearTimeShow ? ` 天` : `` }}</span
						>
					</template>
					<span>{{
						isYearTimeShow && leftDays < 182
							? "虽已过半年，但切莫焦虑"
							: `珍惜每${!isYearTimeShow ? "一分" : "天"}，切勿浪费时间`
					}}</span>
				</n-tooltip>
			</div>
		</n-layout-header>
		<n-scrollbar
			ref="contentRef"
			style="height: calc(100% - 64px)"
			@scroll="handleScroll"
		>
			<n-layout-content class="overflow-hidden p-6">
				<n-collapse
					class="overflow-hidden"
					display-directive="show"
					:default-expanded-names="expandedNames"
					@item-header-click="handleItemHeaderClick"
					accordion
				>
					<n-collapse-item
						title="待办纪要"
						:name="2"
						display-directive="show"
						disabled
					>
						<template #header-extra>
							<span
								:class="[
									'mr-4',
									'rounded-8',
									'p-2',
									'pb-1',
									'z-50',
									'cursor-default',
									{
										'hover:bg-gray-700': store.darkTheme,
										'hover:bg-gray-200': !store.darkTheme,
									},
								]"
								@click.stop="() => {}"
							>
								<n-tooltip placement="top" trigger="hover">
									<template #trigger>
										<n-icon class="mr-5" @click.stop="switchListType">
											<IMaterialSymbolsMenu
												v-if="store.isTodoList"
												class="text-18px"
											/>
											<IGgMenuGridR v-else class="text-18px" />
										</n-icon>
									</template>
									切换为{{ store.isTodoList ? "方块" : "列表" }}
								</n-tooltip>
								<n-tooltip placement="top" trigger="hover" >
									<template #trigger>
										<n-icon class="mr-5" @click.stop="switchCondition">
											<IMaterialSymbolsTopPanelCloseOutline v-if="!hiddenCondition" class="text-18px" />
											<IMaterialSymbolsBottomPanelCloseOutlineSharp v-else class="text-18px" />
										</n-icon>
									</template>
									{{ hiddenCondition ? '展开工具栏' : '收起工具栏' }}
								</n-tooltip>
								<n-tooltip placement="top" trigger="hover">
									<template #trigger>
										<n-icon class="mr-5" @click.stop="clearAllData">
											<ICarbonClean class="text-18px" />
											<!-- import CarbonClean from '~icons/carbon/clean'; -->
										</n-icon>
									</template>
									清除所有待办事项
								</n-tooltip>
								<n-tooltip
									v-if="store.loginBizUser"
									placement="top"
									trigger="hover"
								>
									<template #trigger>
										<n-icon class="mr-5">
											<IIconParkOutlineExcel
												class="text-18px"
												@click.stop="handleExportExcel"
											/>
										</n-icon>
									</template>
									导出表格
								</n-tooltip>
								<n-tooltip placement="top" trigger="hover">
									<template #trigger>
										<n-icon>
											<IZondiconsAddOutline
												class="text-16px"
												@click.stop="handleAddTodo"
											/>
										</n-icon>
									</template>
									添加待办纪要
								</n-tooltip>
								<!-- <n-tooltip placem -->
								<n-tooltip
									placement="top"
									trigger="hover"
								>
									<template #trigger>
										<n-icon
											class="ml-18px mr-18px cursor-pointer"
											@click.stop="batchClick"
										>
											<ICarbonBatchJob class="text-16px" v-if="!isBatch" />
											<IMdiCancelBoxMultiple class="text-16px" v-else />
										</n-icon>
									</template>
									{{ isBatch ? "取消批量操作" : "批量操作" }}
								</n-tooltip>
								<n-tooltip
									v-if="checkedTodoOptions.length"
									placement="top"
									trigger="hover"
								>
									<template #trigger>
										<n-icon
											class="mr-18px cursor-pointer"
											@click.stop="handleDeleteTodo"
										>
											<IMaterialSymbolsDeleteOutline class="text-16px" />
										</n-icon>
									</template>
									批量删除
								</n-tooltip>
								<n-tooltip placement="top" trigger="hover">
									<template #trigger>
										<n-icon @click.stop="exportShowTodoList">
											<IClarityExportLine class="text-16px" />
										</n-icon>
									</template>
									{{
										checkedTodoOptions.length ? "导出勾选展示数据" : "导出展示数据"
									}}
								</n-tooltip>
							</span>
						</template>
						<TodoList
							ref="todoRef"
							v-model:checkedOptions="checkedTodoOptions"
              v-model:hiddenCondition="hiddenCondition"
              v-model:isBatch="isBatch"
						/>
					</n-collapse-item>
				</n-collapse>
			</n-layout-content>
			<n-tooltip v-if="showTopButton" placement="top" trigger="hover">
				<template #trigger>
					<n-button
						circle
						size="small"
						class="fixed right-8 bottom-1"
						@click="scrollToTop"
					>
						<ISystemUiconsPushUp />
					</n-button>
				</template>
				回到顶部
			</n-tooltip>
		</n-scrollbar>
		<cate-modal />
		<item-modal />
		<float-btn />
		<update />
	</n-layout>
</template>

<script lang="ts" setup>
import { useStore } from "../store";

import CategoryCard from "./CategoryCard.vue";
import CateModal from "./CateModal.vue";
import ItemModal from "./ItemModal.vue";
import FloatBtn from "./FloatBtn.vue";
import TodoList from "./Todo/index.vue";

import Update from "./Update/index.vue";
import type { CollapseProps } from "naive-ui";

// import { writeTextFile, readTextFile } from '@tauri-apps/api/fs'
// import { open, save } from '@tauri-apps/api/dialog'

import { formatTimeTodayLast } from "../hooks/useTime";
import { fetchPostPromise, getToken } from "../hooks/useRequest";
// import { Body, fetch } from '@tauri-apps/api/http'
// const { service } = axiosServie()

import axios from "axios";

const { hour, minute, second } = formatTimeTodayLast();

const store = useStore();
const todoRef = ref<typeof TodoList>();

const contentRef = ref();

const checkedTodoOptions = ref<Record<string, any>[]>([]);
const hiddenCondition = ref<Boolean>(true);
const isBatch = ref<Boolean>(false)

const isYearTimeShow = ref<Boolean>(false);

const expandedNames = ref([2]);

onMounted(() => {
	getLeftDays();
	// expandedNames.value = store.activeVal
});

const showTopButton = ref(false);

const searchWebKey = ref("");
const showWebList = computed(() => {
	if (!searchWebKey.value.trim()) return store.data;

	return store.data.filter(
		(v) =>
			v.label.indexOf(searchWebKey.value) !== -1 ||
			v.list.some((v) => v.label.indexOf(searchWebKey.value) !== -1)
	);
});

const activeTitle = computed(() => {
	return store.activeVal
		? store.cateToolList[store.activeVal as number]
		: `快捷网站`;
});

const handleItemHeaderClick: CollapseProps["onItemHeaderClick"] = ({
	name,
	expanded,
}) => {
	if (!expanded) {
		store.activeVal = null;
		return;
	}
	showTopButton.value = false;
	store.activeVal = name;
};

watchEffect(() => {
	// if (store.showCateToolList.length > 0) {
	// 	expandedNames.value = store.activeVal;
	// }
});

function switchCondition() {
  todoRef.value?.switchCondition()
}

function batchClick() {
  todoRef.value?.batchClick();
}

function handleDeleteTodo() {
  todoRef.value?.handleDeleteTodo();
}
function exportShowTodoList() {
  todoRef.value?.exportShowTodoList();
}

function switchListType() {
	store.isTodoList = !store.isTodoList;
}

function handleAddTodo() {
	todoRef.value?.handleShowModal();
}

const clearAllData = () => {
	window.$dialog.warning({
		title: "警告",
		content: "确定删除所有数据？建议先点击上方按钮导出备份",
		positiveText: "确定",
		negativeText: "不确定",
		onPositiveClick: () => {
			if (store.activeVal === 1) {
				store.data = [];
			} else if (store.activeVal === 2) {
				store.todoData = [];
			}
			window.$notification.success({
				title: "清空成功",
				duration: 3000,
			});
		},
	});
};

const handleExport = async (data: string) => {
	// const selete = await save({
	//   filters: [
	//     {
	//       name: 'backup',
	//       extensions: ['json'],
	//     },
	//   ],
	// })
	// let exportData = store.activeVal === 1 ? store.data : store.todoData
	// if (store.activeVal === 2) {
	//   exportData = checkedTodoOptions.value
	// }
	// if (selete) {
	//   await writeTextFile(selete, JSON.stringify(exportData))
	//   window.$notification.success({
	//     title: '导出成功',
	//     duration: 3000,
	//   })
	// } else {
	//   window.$notification.info({
	//     title: '取消导出',
	//     duration: 3000,
	//   })
	// }
};
const handleImport = async () => {
	// const selete = await open({
	//   filters: [
	//     {
	//       name: 'backup',
	//       extensions: ['json'],
	//     },
	//   ],
	// })
	// if (selete) {
	//   try {
	//     const data = await readTextFile(selete as string)
	//     console.log('import: ', data)
	//     if (store.activeVal === 1) {
	//       store.data = JSON.parse(data)
	//     } else if (store.activeVal === 2) {
	//       const loadJsonData = (isNew = false) => {
	//         if (isNew) {
	//           const newId = Date.now() +  Math.floor(Math.random() * 1000)
	//           const newTodoData = JSON.parse(data).map((v: paramsTodoType, index: number) => {
	//             if (v.createdAt) v.createdAt = new Date(v.createdAt)
	//             if (v.updatedAt) v.updatedAt = new Date(v.updatedAt)
	//             else if (v.createdAt) v.updatedAt = new Date(v.createdAt)
	//             v.id = newId + index
	//             v.isRomote = false
	//             return v
	//           })
	//           store.todoData = newTodoData
	//         } else {
	//           const notCompltedData = JSON.parse(data).filter((v: paramsTodoType) => !v.isCompleted)
	//           let compltedData: paramsTodoType[] = JSON.parse(data).filter((v: paramsTodoType) => v.isCompleted)
	//           JSON.parse(data).forEach((v: paramsTodoType, index: number) => {
	//             const existIndex = store.todoData.findIndex(todoItem => todoItem.id === v.id && (todoItem.content !== v.content || todoItem.memo !== v.memo))
	//             if (existIndex != -1) {
	//               const tempData: paramsTodoType = v
	//               if (v.updatedAt) {
	//                 tempData.updatedAt = new Date(v.updatedAt)
	//               }
	//               tempData.memo = v.memo
	//               tempData.content = v.content
	//               compltedData.splice(existIndex, 1, tempData)
	//             }
	//           })
	//           store.todoData = notCompltedData.concat(compltedData)
	//         }
	//       }
	//       window.$dialog.warning({
	//         title: '是否标识为新数据？',
	//         content: '此操作将会标识当前数据为新产生的数据，是否继续？',
	//         positiveText: '是',
	//         negativeText: '不标识为新数据',
	//         onPositiveClick: () => {
	//           loadJsonData(true)
	//           window.$notification.success({
	//             title: '导入成功',
	//             duration: 3000,
	//           })
	//         },
	//         onNegativeClick: () => {
	//           loadJsonData(false)
	//           window.$notification.success({
	//             title: '导入成功',
	//             duration: 3000,
	//           })
	//         }
	//       })
	//     }
	//   } catch (e) {
	//     window.$notification.error({
	//       title: '数据异常',
	//       content: '原因：' + e,
	//     })
	//   }
	//   return
	// } else {
	//   window.$notification.info({
	//     title: '取消导入',
	//     duration: 3000,
	//   })
	// }
};

const { VITE_APP_API_URL } = import.meta.env;

const handleExportExcel = () => {
	const exportExcelUrl = `/bizTask/exportBizTaskExcel`;
	//
	// window.$notification.info({
	//   title: '开发调整中'
	// })
	// TODO: 附件下载
	todoRef.value?.expotExcelCallback((params: Record<string, any>) => {
		const getBlobData = async () => {
			const response = await axios.post<Blob>(
				`${VITE_APP_API_URL}${exportExcelUrl}`,
				params,
				{
					headers: { "biz-user": window.utools.dbStorage.getItem('loginUid') },
					responseType: "blob", // 设置响应类型为 blob
				}
			);
			return {
				data: response.data,
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
				config: response.config,
			};
		};
		getBlobData().then((result) => {
			// const result = (res as any) as Blob
			console.log(result);
			console.log(result.data instanceof Blob);
			let blob = new Blob([result.data]);
			let link = window.URL.createObjectURL(blob);
			let a = document.createElement("a");
			a.download = "待办报表.xlsx";
			a.href = link;
			a.click();
		});
	});
};

const handleAddCate = () => {
	store.cateModal.title = "添加分类";
	store.cateModal.label = "";
	store.cateModal.prevLabel = "";
	store.cateModal.isShow = true;
};

const leftDays = ref(0);
const getLeftDays = () => {
	// 今天的标准时间
	let today = new Date();
	// 本年最后标准时间
	let endYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);
	// 一天的毫秒数
	let msPerDay = 24 * 60 * 60 * 1000;
	// 计算剩余毫秒除以一天的毫秒数，就是天数
	leftDays.value = Math.round((endYear.getTime() - today.getTime()) / msPerDay);
};

function handleScroll(e: Event) {
	const scrollTop =
		(e.target as HTMLElement).scrollTop || (e.target as HTMLElement).scrollTop;
	// const distanceToBottom = (e.target as HTMLElement).scrollHeight - (e.target as HTMLElement).scrollTop - window.innerHeight;
	showTopButton.value = scrollTop > window.innerHeight * 1.45;
}
const scrollToTop = () => {
	contentRef?.value.scrollTo({
		top: 0,
		behavior: "smooth",
	});
};
</script>
