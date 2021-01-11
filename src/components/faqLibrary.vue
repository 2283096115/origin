<template>
  <div id="faq-library-container"
    class="faq-library"
    ref="faqRoot">
    <div class="left faq-library-left">
      <h2 class="faq-library-left-title ">
        {{config.pageTitle}}
      </h2>
      <div class="faq-library-cate">
        <div class="cate-title clearfix">
          <el-select v-model="searchCategoryObj"
            filterable
            remote
            clearable
            :placeholder="$t('faq.faqLibrary.faqLibrary.searchCategory')"
            :remote-method="searchCategory"
            @change="searchCategoryChange"
            @clear="searchCategoryId=null"
            class="search-cate-input">
            <el-option v-for="item in categoryConclude"
              :key="item.id"
              :label="item.value"
              :value="item">
            </el-option>
          </el-select>
          <div class="cate-list__title"
            v-if="!hasTenant">
            <span class="left pointer all-cate-item"
              :class="currCatoryId==-1?'checked-text':''"
              @click="cateChange(-1, $t('faq.faqLibrary.faqLibrary.allCategories'))">
              <span>{{$t('faq.faqLibrary.faqLibrary.allCategories')}}</span>
              <span>({{publicFaqNum}})</span>
            </span>
            <i v-if="getRights(hasEditCategory, 'MISSION_SCENE_UPDATE')"
              class="right iconfont icon-paixu add-icon pointer margin-left6"
              @click="sortSubCate"></i>
            <i v-if="getRights(hasEditCategory, 'MISSION_SCENE_UPDATE')"
              class="right iconfont icon-leibielan-tianjia add-icon pointer"
              @click="createCateModal = true"></i>
          </div>
        </div>
        <ul class="type-tree-lists common-is-scrollbar-none"
          :class="{ 'type-tree-lists-less-top': hasTenant }">
          <type-tree v-for="item in allCateData"
            :key="item.id"
            ref="typeTreeComponent"
            :model="item"
            :faqType="config.faqType"
            :currCategoryId="currCatoryId"
            :cateData="item.isPrivate ? privateCateData : cateData"
            :hasEditUserGroup="hasEditUserGroup"
            :disabled="!getRights(hasEditCategory, 'MISSION_SCENE_UPDATE') || item.disabled"
            :isPrivate="Boolean(item.isPrivate)"
            :groupIncludeMe="groupIncludeMe"
            :cateGroup="cateGroup"
            :groupOptions="groupOptions"
            @getCate="getCate"
            @updateGroup="initUserGroup"
            @cateChange="cateChange">
          </type-tree>
        </ul>
      </div>
    </div>
    <div class="right faq-library-right">
      <div class="right-header">
        <div class="title-container clearfix">
          <h2 class="cate-title left"
            :title="currentCatoryName">
            {{currentCatoryName | strLength(12)}}
          </h2>
          <div class="right title-btn-con">
            <el-button @click="exportConfirm"
              v-if="hasExport"
              :loading="exportLoading">
              <i class="iconfont icon-biaoge-daochu"></i>
              {{$t('common.operate.export')}}
            </el-button>
            <el-button type="primary"
              v-if="hasImport"
              @click="clickImportBtn()">
              <i class="iconfont icon-zhishiku-daoru"></i>
              {{importFaqButtonText}}
            </el-button>
            <el-button type="primary"
              @click="createFaq"
              v-if="getRights(hasEdit, 'MISSION_SCENE_INSERT')">
              <i class="iconfont icon-leibielan-tianjia"></i>
              {{addFaqButtonText}}
            </el-button>
          </div>
        </div>
      </div>
      <div class="right-body">
        <div class="body-title-container clearfix">
          <el-input class="left search-input"
            :placeholder="searchInputPlaceholder"
            v-model='filterCond.text'
            @keydown.enter.native="searchFaq">
            <i class="icon-sousuo iconfont pointer"
              @click="searchFaq"
              slot="suffix"></i>
            <el-select class="search-select"
              slot="prepend"
              v-model="filterCond.searchKey">
              <el-option v-for="item in allSearchKey"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </el-input>
          <div class="operate-container right">
            <el-select v-model="filterCond.status"
              @change="filterChange"
              clearable
              :placeholder="$t('faq.faqLibrary.faqLibrary.stateFilter')">
              <el-option v-for="item in statusFilter"
                :key="item.value"
                :label="item.text"
                :value="item.value">
              </el-option>
            </el-select>
            <span @click="ifAdvanceFilter=true"
              v-if="showAdvanceFilter"
              class='u-click1'>
              <el-tooltip popper-class="u-tooltip"
                class="item"
                effect="dark"
                placement="top"
                :content="$t('faq.faqLibrary.faqLibrary.advancedFilter')">
                <i class="iconfont icon-biaoge-shaixuan"
                  :class="{ 'color-infor': advanceFilterActive }"></i>
              </el-tooltip>
            </span>
            <span @click="multiOperation=!multiOperation;clearSelection()"
              class='u-click1'
              v-if='hasMultiOperate'>
              <el-tooltip popper-class="u-tooltip"
                class="item"
                effect="dark"
                placement="top"
                :content="$t('faq.faqLibrary.faqLibrary.batchOperate')">
                <i class="iconfont"
                  :class="multiOperation ? 'icon-biaoge-piliang-guanbi' : 'icon-biaoge-piliang'"></i>
              </el-tooltip>
            </span>
            <span class='u-click1'
              @click="showSpeach"
              v-if="viewSetting.showFaqTime && !config.isMissionType && !config.isProcessIntentType">
              <el-tooltip popper-class="u-tooltip"
                class="item"
                effect="dark"
                placement="top"
                content="话术设置">
                <span>
                  <i class="iconfont icon-shezhimian"></i>
                </span>
              </el-tooltip>
            </span>
          </div>
        </div>
        <div class="body-container clearfix">
          <div class="faq-table-container">
            <el-table stripe
              :both-space="true"
              :data="faqData"
              header-cell-class-name="faq-table-header"
              @sort-change="sortChange"
              :row-class-name="rowClassName"
              @selection-change="handleSelectionChange"
              row-key="id"
              :key="multiOperation"
              :style="`min-width:${config.tableMinWidth}`"
              ref="multipleTable">
              <el-table-column sortable="custom"
                prop="id"
                :is-space="true"
                :label="$t('faq.faqLibrary.faqLibrary.serialNumber')"
                min-width="15"
                v-if="!multiOperation">
                <template slot-scope="scope"
                  class="table-id">
                  <div>
                    {{ scope.row.id }}
                    <el-tooltip placement="right"
                      :visible-arrow="false"
                      effect="light"
                      popper-class="faq-libirary-tooltip__popper"
                      v-if="config.hasAnalyze">
                      <div slot="content"
                        class="faq-libirary-tooltip-container">
                        <template v-if="isReplaceFaqAnalyse">
                          <div style="padding: 8px;">点击可跳转查看近7日数据</div>
                        </template>
                        <template v-else>
                          <div class="tooltip-header">{{$t('faq.faqLibrary.faqLibrary.dataInLastOneWeek')}}</div>
                          <div class="tooltip-body">
                            <ul class="data-lists">
                              <li>
                                <i
                                  style="background: #3FE57E;border-radius: 50%;width: 10px;height: 10px;font-style: normal;display: inline-block;margin-right: 5px;"></i>
                                <span class="data-text">{{$t('faq.faqLibrary.faqLibrary.hits')}}</span>
                                <span class="data-num">{{tablePoperData.hit}}</span>
                              </li>
                              <li>
                                <i
                                  style="background: #365EEE 100%;border-radius: 50%;width: 10px;height: 10px;font-style: normal;display: inline-block;margin-right: 5px;"></i>
                                <span class="data-text">{{$t('faq.faqLibrary.faqLibrary.upvotes')}}</span>
                                <span class="data-num">{{tablePoperData.like}}</span>
                              </li>
                              <li>
                                <i
                                  style="background: #F26A6A;border-radius: 50%;width: 10px;height: 10px;font-style: normal;display: inline-block;margin-right: 5px;"></i>
                                <span class="data-text">{{$t('faq.faqLibrary.faqLibrary.downvotes')}}</span>
                                <span class="data-num">{{tablePoperData.dislike}}</span>
                              </li>
                            </ul>
                          </div>
                          <div class="tooltip-footer">
                            <el-button type="primary"
                              size="small"
                              @click="openNewTab(scope.row.id, scope.row.question)">
                              {{$t('faq.faqLibrary.faqLibrary.viewDetails')}}>
                            </el-button>
                          </div>
                        </template>
                      </div>
                      <i class="iconfont icon-biaoge-quxian hover-infor"
                        v-if="!config.isMissionType"
                        @click="toFaqAnalyseFn(scope.row.id, 'click')"
                        @mouseenter="toFaqAnalyseFn(scope.row.id, 'mouseenter')"></i>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
              <el-table-column width="100"
                type="selection"
                :reserve-selection="true"
                v-if="multiOperation"></el-table-column>
              <el-table-column v-if="config.isKnowledgeBase"
                :label="$t('faq.faqLibrary.faqLibrary.intentName')"
                min-width="14">
                <template slot-scope="scope">
                  <div class="ellipsis"
                    :title="scope.row.name">
                    <span v-if="config.isKnowledgeBase">{{ scope.row.name }}</span>
                    <span v-else>{{ scope.row.intention.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="question"
                :label="$t('faq.faqLibrary.faqLibrary.question')"
                min-width="30">
                <template slot-scope="scope">
                  <div class="hover-infor ellipsis"
                    :title="scope.row.question"
                    @click="editFaq(scope.row)">{{ scope.row.question }}</div>
                </template>
              </el-table-column>
              <el-table-column sortable="custom"
                prop="similarsCount"
                :label="$t('faq.faqLibrary.faqLibrary.similarQuestion')"
                min-width="12">
                <template slot-scope="scope">
                  <div @click="editSimilars(scope.row)"
                    class="hover-infor">
                    <span>{{ scope.row.similarsCount}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column sortable="custom"
                prop="templateCount"
                :label="$t('faq.faqLibrary.faqLibrary.grammerTemplate')"
                min-width="12"
                v-if="viewSetting.showGrammerTemplate">
                <template slot-scope="scope">
                  <div @click="editTemplate(scope.row)"
                    class="hover-infor">
                    <span>{{ scope.row.templateCount || 0}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="similarsCount"
                :label="$t('knowledge.faq.missionScene.components.answerNodeComponent.associatedTask')"
                min-width="14"
                v-if="config.isProcessIntentType">
                <template slot-scope="scope">
                  <div>
                    <el-tooltip :disabled="scope.row.relateMission.length === 0"
                      popper-class="u-tooltip"
                      placement="top">
                      <div slot="content">
                        <span v-for="(rm, idx) in scope.row.relateMission"
                          :key="idx">
                          {{ rm }}
                          <br />
                        </span>
                      </div>
                      <span>{{ scope.row.relateMission.length }}</span>
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
              <el-table-column sortable="custom"
                prop="updatedAt"
                :label="$t('faq.faqLibrary.faqLibrary.lastModified')"
                min-width="18"
                width="160">
                <template slot-scope="scope">
                  <div>{{scope.row.updatedAt | moment}}</div>
                </template>
              </el-table-column>
              <el-table-column :label="$t('knowledge.faq.missionScene.missionList.statistics')"
                min-width="24"
                width="70"
                v-if="config.isMissionType">
                <template slot-scope="scope">
                  <a href="javascript:void(0)"
                    @click="taskStatistics(scope.row.id, scope.row.question)">
                    <svg class="icon"
                      aria-hidden="true">
                      <use xlink:href="#icon-shujufenxi"></use>
                    </svg>
                  </a>
                </template>
              </el-table-column>
              <el-table-column :label="$t('faq.faqLibrary.faqLibrary.state')"
                class-name="table-row-status"
                min-width="16">
                <template slot-scope="scope">
                  <div>
                    <span :class="statusObj(scope.row.status).class"
                      class="faq-status">
                      <i class="iconfont vertical-middle"
                        :class="statusObj(scope.row.status).iconClass"></i>
                      <span class="vertical-middle ellipsis">{{statusObj(scope.row.status).name}}</span>
                    </span>
                  </div>
                </template>
              </el-table-column>
              <!-- 要有编辑权限或者删除权限，才会展示操作列 -->
              <el-table-column :is-space="true"
                :label="$t('faq.faqLibrary.faqLibrary.operation')"
                min-width="12"
                v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE') || getRights(hasDelete, 'MISSION_SCENE_DELETE')">
                <template slot-scope="scope">
                  <el-tooltip popper-class="u-tooltip"
                    :content="scope.row.status === 220 ? $t('faq.faqLibrary.faqLibrary.cancelOffline') : $t('faq.faqLibrary.faqLibrary.cancelOnline')"
                    placement="top">
                    <i class="iconfont icon-biaoge-quxiaoshenqing color-infor"
                      v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE') && [200, 220, 400].indexOf(scope.row.status) !== -1"
                      @click="cancel(scope.row.id)"></i>
                  </el-tooltip>
                  <el-tooltip popper-class="u-tooltip"
                    :content="$t('faq.faqLibrary.faqLibrary.launch')"
                    placement="top">
                    <i class="iconfont icon-biaoge-shangxian color-infor"
                      v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE') && scope.row.status === 100"
                      @click="online(scope.row.id)"></i>
                  </el-tooltip>
                  <el-tooltip popper-class="u-tooltip"
                    :content="$t('faq.faqLibrary.faqLibrary.remove')"
                    placement="top">
                    <i class="iconfont icon-biaoge-xiaxian color-infor"
                      @click="offlineConfirm(scope.row)"
                      v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE') && scope.row.status === 110"></i>
                  </el-tooltip>
                  <span @click="editFaq(scope.row)"
                    v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE') && scope.row.status === 410"
                    class="color-infor cursor-pointer">{{$t('faq.faqLibrary.faqLibrary.reedit')}}</span>
                  <span @click="repub(scope.row.id)"
                    v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE') && scope.row.status >= 500 && navAuth.publishGroup"
                    class="color-infor cursor-pointer">{{$t('faq.faqLibrary.faqLibrary.rerelease')}}</span>
                  <el-tooltip popper-class="u-tooltip"
                    :content="(scope.row.relateMission || []).length ? '该意图关联有未下线的资料知识,不能删除' : '删除'"
                    placement="top">
                    <i class="iconfont icon-biaoge-shanchu color-danger"
                      v-if="getRights(hasDelete, 'MISSION_SCENE_DELETE') && scope.row.status === 100 || (scope.row.status === 500 && config.isMissionType)"
                      @click="!(scope.row.relateMission || []).length && deleteFaq(scope.row.id)"></i>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="faq-table-footer clearfix">
            <div class="faq-table-tip">
              <span class="color-infor"
                v-if="multiOperation">
                {{$t('faq.faqLibrary.faqLibrary.selectedPrefix')}} {{multipleSelection.length}}
                {{$t('faq.faqLibrary.faqLibrary.selectedSuffix')}}
              </span>
            </div>
            <div class="left multi-operate-container"
              v-if="multiOperation">
              <el-button @click="multiEdit">{{$t('editLeadingWordDialog.title')}}</el-button>
              <el-button v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE')"
                @click="multiUpdateFaq('on')">{{$t('common.operate.online')}}</el-button>
              <el-button v-if="getRights(hasEdit, 'MISSION_SCENE_UPDATE')"
                @click="multiUpdateFaq('off')">{{$t('common.operate.offline')}}</el-button>
              <el-button v-if="getRights(hasDelete, 'MISSION_SCENE_DELETE')"
                @click="multiUpdateFaq('del')">{{$t('common.operate.delete')}}</el-button>
              <drop-down :notNegativeVal="true"
                :cateData="currentCateData"
                @cateId="moveToCate"
                :defaultCate="[]"
                v-if="multiOperation && getRights(hasEdit, 'MISSION_SCENE_UPDATE')"></drop-down>
            </div>
            <el-pagination class="right"
              @current-change="pageChange"
              @size-change="sizeChange"
              :current-page="filterCond.pageNo"
              :page-size="filterCond.pageSize"
              :pager-count="5"
              layout="total, sizes, prev, pager, next"
              :total="faqCount"
              :page-sizes="[10,20,50,100]"></el-pagination>
          </div>
        </div>
      </div>
    </div>
    <!-- 下线关联问提示 -->
    <el-dialog width="400px"
      :close-on-click-modal="false"
      :title="$t('faq.faqLibrary.faqLibrary.offlineKnowledge')"
      :visible.sync="relevanceData.showRelevance">
      <h3 class="relevance-tip">{{$t('faq.faqLibrary.faqLibrary.relevanceTips')}}</h3>
      <el-table max-height="400"
        :data="relevanceData.rows"
        style="width: 100%">
        <el-table-column prop="question"
          :label="$t('faq.faqLibrary.faqLibrary.standardQuestion')"
          width="200">
        </el-table-column>
        <el-table-column prop="type"
          :label="$t('faq.faqLibrary.faqLibrary.knowledgeType')"
          width="100">
          <template slot-scope="scope">
            <span>{{`${relevanceData.faqMap[scope.row.faqType].name || '--'}`}}{{$t('faq.faqLibrary.faqLibrary.Library')}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('faq.faqLibrary.faqLibrary.category')">
          <template slot-scope="scope">
            <span>{{scope.row.category["name"] || '--'}}</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer"
        class="dialog-footer">
        <el-button type="grey"
          @click="relevanceData.showRelevance = false;relevanceData.operteFaqs = []">
          {{$t('faq.faqLibrary.faqLibrary.cancel')}}</el-button>
        <el-button type="warning"
          :disabled="relevanceData.loading"
          @click="offlineAndRelationDeal('save')">保留关联关系</el-button>
        <el-button type="primary"
          :disabled="relevanceData.loading"
          @click="offlineAndRelationDeal">{{$t('faq.faqLibrary.faqLibrary.offlineAndRelease')}}</el-button>
      </div>
    </el-dialog>
    <create-cate-dialog v-if="createCateModal"
      :cateData="cateData"
      :faqType="config.faqType"
      :cateGroup="cateGroup"
      :groupOptions="groupOptions"
      @cancel="createCateModal=false"
      @finish="finishCreateCate"></create-cate-dialog>
    <slider-dialog :isForm="true"
      v-if="ifEdictSimilars">
      <header class='header-dialog-title'>
        <h2 class='header-dialog-content'>{{$t('faq.faqLibrary.faqLibrary.similarQuestion')}}</h2>
      </header>
      <edit-similar :faq="faqForSimilarEdit"
        :disabled="!getRights(hasEdit, 'MISSION_SCENE_UPDATE')"
        :faqType="config.faqType"
        @saved="emmitSaved"
        @cancel="ifEdictSimilars=false"></edit-similar>
    </slider-dialog>
    <slider-dialog :isForm="true"
      v-if="ifEditTemplate">
      <header class='header-dialog-title-once'>
        <h2 class='header-dialog-content-once'>{{$t('faq.faqLibrary.faqLibrary.EditQuestionTemplate')}}-
        </h2>
        <el-tooltip :content="faqForTemplate.question"
          effect="dark"
          placement="left">
          <h2 class="header-dialog-grammar">{{faqForTemplate.question}}</h2>
        </el-tooltip>

      </header>
      <grammer-template :faq="faqForTemplate"
        :disabled="!getRights(hasEdit, 'MISSION_SCENE_UPDATE')"
        @saved="emmitSaved"
        :faqId="+faqForTemplate.id"
        :faqType="config.faqType"
        @cancel="ifEditTemplate=false"></grammer-template>
    </slider-dialog>
    <!-- 新建faq右侧弹窗 -->
    <slider-dialog :isForm="true"
      v-if="ifCreateFaq"
      class="big-slide">
      <header class='header-dialog-title'>
        <h2 class='header-dialog-content'>{{$t('faq.faqLibrary.faqLibrary.addNewQuestions')}}</h2>
      </header>
      <faq-editor v-if="config.faqType !== 20"
        :cateData="currentCateData"
        :isPrivate="currCategoryIsPrivate"
        :CategoryId="currCatoryId"
        :fromFaqLibrary="true"
        :faq="undefined"
        :faqType="config.faqType"
        :isIntention="config.faqType===2"
        :newAns="true"
        :hideEdit="!getRights(hasEdit, 'MISSION_SCENE_UPDATE')"
        :useRelatedSlot="useRelatedSlot"
        :showRule="this.config.needAnswerRuleFilter"
        @cancel="ifCreateFaq=false"
        @confirm="ifCreateFaq=false;getFaq();getCateFaqCount()"></faq-editor>
    </slider-dialog>
    <!-- 编辑 -->
    <slider-dialog :isForm="true"
      :lazyLoading="true"
      v-if="ifEditFaq"
      class="big-slide">
      <header class='header-dialog-title'>
        <h2 class='header-dialog-content left'>{{editFaqDialogTitle}}</h2>
        <div class="edit-header-button-container right"
          v-if="hasTenant && !currCategoryIsPrivate && getRights(hasEdit, 'MISSION_SCENE_UPDATE')">
          <el-button @click="changeFaqEditorMod('private')"
            v-if="editFaqMod==='all'">
            {{$t('faq.faqLibrary.faqLibrary.editPrivateAnswer', { tenantName: currentTenantName })}}
          </el-button>
          <el-button @click="changeFaqEditorMod('all')"
            v-else>{{$t('faq.faqLibrary.faqLibrary.switchToPublic')}}</el-button>
        </div>
      </header>
      <faq-editor v-if="config.faqType !== 20"
        ref="faqEditorComponent"
        :cateData="currentCateData"
        :isPrivate="currCategoryIsPrivate"
        :editFaqMod="editFaqMod"
        :CategoryId="currCatoryId"
        :fromFaqLibrary="true"
        :comp="editCompConfig"
        :faq="undefined"
        :faqId="faqForEdit||null"
        :faqType="config.faqType"
        :hideEdit="!getRights(hasEdit, 'MISSION_SCENE_UPDATE')"
        :isIntention="config.faqType===2"
        :useRelatedSlot="useRelatedSlot"
        :showRule="this.config.needAnswerRuleFilter"
        @cancel="ifEditFaq=false"
        @confirm="ifEditFaq=false;getFaq();getCateFaqCount()"></faq-editor>
    </slider-dialog>
    <slider-dialog v-if="ifAdvanceFilter">
      <header class='header-dialog-title'>
        <h2 class='header-dialog-content'>{{$t('faq.faqLibrary.faqLibrary.advancedFilter')}}</h2>
      </header>
      <advance-filter @changeFilter="changeAdvanceFilter"
        :config="config"
        :filterValue="advanceFilterCond"
        :dictionaries="dictionariesData"></advance-filter>
    </slider-dialog>
    <el-dialog width="360px"
      :close-on-click-modal="false"
      :title="$t('faq.faqLibrary.faqLibrary.hint')"
      :visible.sync="deleteConfirm">
      <div class="el-dialog__status el-icon-warning"></div>
      <div class="el-dialog__message"
        v-if="config.faqType===3">
        <h2>{{$t('faq.faqLibrary.faqLibrary.areYouSureToDeleteThisMission')}}?</h2>
        <p>{{$t('faq.faqLibrary.faqLibrary.missionWillBePermanentlyRemovedAfterConfirmation')}}</p>
      </div>
      <div class="el-dialog__message"
        v-else-if="config.faqType===30 || config.faqType===2">
        <h2>{{$t('faq.faqLibrary.faqLibrary.areYouSureToDeleteThisProcessIntent')}}?</h2>
        <p>{{$t('faq.faqLibrary.faqLibrary.processIntentWillBePermanentlyRemovedAfterConfirmation')}}</p>
      </div>
      <div class="el-dialog__message"
        v-else>
        <h2>{{$t('faq.faqLibrary.faqLibrary.areYouSureToDeleteThisFAQ')}}?</h2>
        <p>{{$t('faq.faqLibrary.faqLibrary.itWillBePermanentlyRemovedAfterConfirmation')}}</p>
      </div>
      <span slot="footer"
        class="dialog-footer">
        <el-button type="grey"
          @click="deleteConfirm = false">{{$t('faq.faqLibrary.faqLibrary.cancel')}}</el-button>
        <el-button type="primary"
          @click="remove(deleteFaqId, 'del')">{{$t('faq.faqLibrary.faqLibrary.confirm')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog width="360px"
      :close-on-click-modal="false"
      :title="$t('faq.faqLibrary.faqLibrary.hint')"
      :visible.sync="multiUpdateOption.showConfirmModel">
      <div class="el-dialog__status el-icon-warning"></div>
      <div class="el-dialog__message">
        <h2>{{$t(`faq.faqLibrary.faqLibrary.batchUpdateConfirm.${multiUpdateOption.opType}`)}}?</h2>
        <p>{{$t(`faq.faqLibrary.faqLibrary.batchUpdateHint.${multiUpdateOption.opType}`)}}</p>
      </div>
      <span slot="footer"
        class="dialog-footer">
        <el-button type="grey"
          @click="cancelMultiUpdate">{{$t('faq.faqLibrary.faqLibrary.cancel')}}</el-button>
        <el-button type="primary"
          @click="multiUpdateFaqConfirm(multiUpdateOption.opType)">{{$t('faq.faqLibrary.faqLibrary.confirm')}}
        </el-button>
      </span>
    </el-dialog>
    <el-dialog width="480px"
      :close-on-click-modal="false"
      title="FAQ全局话术设置"
      :visible.sync="speachWay">
      <div class="faq__speach--status">状态说明：<el-tag :type="globalSpeachStatus ? 'success' : 'warning'">
          {{globalSpeachStatus ? '已生效' : '审核中'}}</el-tag>
      </div>
      <h2 class="faq__speach--tittle">
        全局未生效话术
        <el-tooltip class="item"
          effect="dark"
          content="未到FAQ生效时间时，将回复此话术；如果同时设置了全局和答案的未生效话术，将优先回复答案的未生效话术"
          placement="right">
          <span class="speach-icon">
            <svg class="icon"
              aria-hidden="true">
              <use xlink:href="#icon-empty-question-mark"></use>
            </svg>
          </span>
        </el-tooltip>
      </h2>
      <el-input class="speach-content"
        type="textarea"
        :readonly="!globalSpeachStatus"
        :rows="3"
        placeholder="请输入标题"
        v-model="speach.effectBeforeAnswer">
      </el-input>
      <h2 class="faq__speach--tittle">
        全局失效话术
        <el-tooltip class="item"
          effect="dark"
          content="超过FAQ失效时间时，将回复此话术；如果同时设置了全局和答案的失效话术，将优先回复答案的失效话术"
          placement="right">
          <span class="speach-icon">
            <svg class="icon"
              aria-hidden="true">
              <use xlink:href="#icon-empty-question-mark"></use>
            </svg>
          </span>
        </el-tooltip>
      </h2>
      <el-input class="speach-content"
        type="textarea"
        :readonly="!globalSpeachStatus"
        :rows="3"
        placeholder="请输入标题"
        v-model="speach.effectAfterAnswer">
      </el-input>
      <span slot="footer"
        class="dialog-footer">
        <el-button type="grey"
          @click="speachWay=false">取消</el-button>
        <el-button type="primary"
          :disabled="!globalSpeachStatus"
          @click="newSpeach">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog width="360px"
      :close-on-click-modal="false"
      :title="$t('faq.faqLibrary.faqLibrary.hint')"
      :visible.sync="offlineErrorModal">
      <div class="el-dialog__status el-icon-warning"></div>
      <div class="el-dialog__message">
        <h2>{{$t('faq.faqLibrary.faqLibrary.failedToOffline')}}:</h2>
        <p v-for="(faq,idx) in faqRelevance"
          :key="idx"
          style="padding-left: 70px;line-height: 20px;">
          <span :title="faq.category">[{{faq.category | strLength(8)}}]&nbsp;&nbsp;</span>
          <span :title="faq.question">{{faq.question | strLength(16)}}</span>
        </p>
      </div>
      <span slot="footer"
        class="dialog-footer">
        <el-button type="primary"
          @click="offlineErrorModal = false">{{$t('faq.faqLibrary.faqLibrary.confirm')}}</el-button>
      </span>
    </el-dialog>
    <el-dialog width="360px"
      :close-on-click-modal="false"
      :title="$t('faq.faqLibrary.faqLibrary.hint')"
      :visible.sync="offlineConfirmModal">
      <div class="el-dialog__status el-icon-warning"></div>
      <div class="el-dialog__message">
        <h2>{{$t('faq.faqLibrary.faqLibrary.confirmOfflineRelatedFaq')}}?</h2>
      </div>
      <span slot="footer"
        class="dialog-footer">
        <el-button type="grey"
          @click="offlineConfirmModal = false">{{$t('faq.faqLibrary.faqLibrary.cancel')}}</el-button>
        <el-button type="primary"
          @click="offlineConfirmModal = false;offline(offlineFaqId);">{{$t('faq.faqLibrary.faqLibrary.confirm')}}
        </el-button>
      </span>
    </el-dialog>
    <!-- 非任务型导入弹窗 -->
    <el-dialog :visible.sync='importDialog'
      :title="$t('faq.faqLibrary.faqLibrary.batchImport')"
      :close-on-click-modal="false"
      class="faq-upload"
      width="600px">
      <template v-if='uploadStatus!=50'>
        <h5 class="normal-title">{{$t('faq.faqLibrary.faqLibrary.importDocuments')}}</h5>
        <el-upload ref="faqUpload"
          :action="uploadAction"
          drag
          :headers="headers"
          :before-upload="handleUploadProgress"
          :multiple="false"
          :limit="1"
          :on-exceed="fileOver"
          :on-remove="fileDelete"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError">
          <i
            class="iconfont icon-chouqurenwu faq-extraction__upload--icon">{{$t('faq.faqLibrary.faqLibrary.uploadNewFile')}}</i>
          <div class="el-upload__text">{{$t('faq.faqLibrary.faqLibrary.orDragFilesHere')}}</div>
        </el-upload>
        <err-info :upload-error-status="uploadErrorStatus"
          :upload-status="uploadStatus"
          :linked-faqs="linkedFaqs"
          @unlinkFaq="unlinkFaq = 1">
          <span>
            <span>{{$t('faq.faqLibrary.faqLibrary.faileToVerifyTheFile')}}</span>
            <span>, </span>
            <span>{{$t('faq.faqLibrary.faqLibrary.click')}}</span>
            <a :href="errorDetailFile"
              class="t-click">{{$t('faq.faqLibrary.faqLibrary.downloadErrorMessage')}}</a>
          </span>
        </err-info>
        <div style="margin-bottom: 20px;"
          v-if="linkedFaqs.length > 0">
          <p style="margin-bottom: 10px;">
            <el-radio :label="1"
              v-model="unlinkFaq"
              style="margin-right: 0px;">
              <span>方式一：</span>
              <span style="font-size: 12px; font-weight: normal; color: black">
                系统自行解除关联关系后对知识点进行下线/删除操作
              </span>
            </el-radio>
          </p>
          <p>
            <el-radio :label="0"
              v-model="unlinkFaq"
              style="margin-right: 0px;">
              <span>方式二：</span>
              <span style="font-size: 12px; font-weight: normal; color: black">
                系统将忽略存有关联关系的知识点并对剩余知识点进行下线/删除操作
              </span>
            </el-radio>
          </p>
        </div>
        <div class="info-text">
          <p>1.{{$t('faq.faqLibrary.faqLibrary.click')}}
            <a @click="downloadTemplate()"
              class="t-click">{{$t('faq.faqLibrary.faqLibrary.downloadTemplates')}}</a>
            <span>{{$t('faq.faqLibrary.faqLibrary.useTheRequiredFormat')}}</span>
            <span v-if="!config.hideSimilar">(
              <span>{{$t('faq.faqLibrary.faqLibrary.attention')}}: </span>
              <span>{{$t('faq.faqLibrary.faqLibrary.ifOnlyToDoBatchCreateNewSimilarQuestions')}}, </span>
              <span>{{$t('faq.faqLibrary.faqLibrary.please')}}</span>
              <a @click="downloadSimilarTemplate()"
                class="t-click">{{$t('faq.faqLibrary.faqLibrary.downloadTheSecondTemplate')}}</a>)</span>
          </p>
          <p>2.{{$t('faq.faqLibrary.faqLibrary.uploadExcelToCompleteBatchImport')}}</p>
          <p>3.{{$t('faq.faqLibrary.faqLibrary.theUploadedFileCantExceed10M')}}</p>
        </div>
      </template>
      <template v-else>
        <!-- {{$t('faq.faqLibrary.faqLibrary.successfullyUploaded')}} -->
        <div class="left">
          <svg class="icon"
            aria-hidden="true"
            style='color:#14cc70;margin-right:20px;font-size:42px'>
            <use xlink:href="#icon-biaozhu-yipipei"></use>
          </svg>
        </div>
        <div class="left"
          style='margin-bottom:20px;'>
          <h2>{{$t('faq.faqLibrary.faqLibrary.dataImportSuccess')}}!</h2>
          <p class="faqSimilarRepeated"
            v-if="faqSimilarRepeatedNum > 0">其中{{faqSimilarRepeatedNum}}条相似问与系统相似问重复,已默认放弃添加</p>
          <p>{{`你可以在“${config.pageTitle}”管理页面中查看详细导入内容`}}</p>
        </div>
      </template>
      <div slot="footer"
        class="dialog-footer">
        <template v-if='uploadStatus!=50'>
          <el-button type="primary"
            v-if="uploadStatus!=40"
            :disabled="uploadStatus!=20"
            @click='importData'>{{$t('faq.faqLibrary.faqLibrary.import')}}</el-button>
          <el-button type="primary"
            v-if="uploadStatus==40"
            :disabled="true"
            @click='importData'
            :loading="true">{{$t('faq.faqLibrary.faqLibrary.importing')}}</el-button>
          <el-button type="grey"
            @click="closeImportDialog">{{$t('faq.faqLibrary.faqLibrary.cancel')}}</el-button>
        </template>
        <template v-else>
          <el-button type="primary"
            @click="closeImportDialog">{{$t('faq.faqLibrary.faqLibrary.IGotIt')}}</el-button>
        </template>
      </div>
    </el-dialog>
    <!-- 任务型导入弹窗 -->
    <task-import-dialog :visible.sync="taskImportDialog"
      :headers="headers"
      :faqType="config.faqType"
      @importSuc="getFaq();getCate();"></task-import-dialog>
    <!-- 任务型导出弹窗 -->
    <task-export-dialog :visible.sync="taskExportDialog"
      :headers="headers"
      :faqType="config.faqType"
      :loading="exportLoading"
      @download="download"></task-export-dialog>
    <!-- 新建流程意图 -->
    <create-process-intent :visible.sync="processIntentAdd"
      :cateList="cateData"
      :operatorType="operatorType"
      :disabled="!getRights(hasEdit, 'MISSION_SCENE_UPDATE')"
      :processIntentForm="processIntentForm"
      @updateList="getFaq();getCate();"></create-process-intent>
    <!-- 导入流程意图 -->
    <process-intent-import-dialog :visible.sync="processIntentImportDialog"
      @updateList="getFaq();getCate();"
      :headers="headers"
      :faqType="config.faqType"></process-intent-import-dialog>
    <!-- 编辑引导语、脚注弹窗 -->
    <edit-leading-word-dialog :visible.sync="editLeadingWordDialogVisible"
      :multi-selection="multipleSelection" />
  </div>
</template>

<script>
import moment from 'moment';
import Vuex from 'vuex';
import _ from 'lodash';
import * as types from 'types';
import getCookie from 'common/utils/getCookie';
import constant from 'common/constant';
import { downloadFileByUrl } from '@system/utils/common';

import viewSetting from '@system/service/viewSetting';
import Role from '@system/service/role';
import sliderDialog from '@system/components/sliderDialog.vue';
import taskImportDialog from './component/taskImportDialog';
import taskExportDialog from './component/taskExportDialog';
import createProcessIntent from './component/createProcessIntent';
import processIntentImportDialog from './component/processIntentImportDialog';
import constants from './constants';

import createCateDialog from './component/createCateDialog.vue';
import typeTree from './typeTree.vue';
import editSimilar from '../component/faqAddSimilar.vue';
import faqEditor from '../component/faqEditor';
import advanceFilter from '../component/advanceFaqFilter.vue';
import dropDown from './dropDown.vue';
import searchInput from '../component/searchCateInput.vue';
import grammerTemplate from '../component/grammerTemplate';
import EditLeadingWordDialog from '@system/routes/knowledge/faq/faqLibrary/component/editLeadingWordDialog';
import errInfo from '@system/routes/knowledge/faq/faqLibrary/component/errInfo';

const rootMsg = constants.ROOT_CATEGORY;
// FAQ、寒暄、任务型
const [TYPE_FAQ, TYPE_GREETING, TYPE_MISSION] = [0, 10, 3];
let role;

export default {
  'components': {
    EditLeadingWordDialog,
    createCateDialog,
    typeTree,
    sliderDialog,
    editSimilar,
    faqEditor,
    dropDown,
    advanceFilter,
    searchInput,
    grammerTemplate,
    taskImportDialog,
    taskExportDialog,
    createProcessIntent,
    processIntentImportDialog,
    errInfo
  },
  'props': {
    'useRelatedSlot': {
      'type': Boolean,
      default() {
        return true;
      }
    },
    'useCustomParams': {
      'type': Boolean,
      default() {
        return false;
      }
    }
  },
  created() {
    this.initUserGroup();
  },
  computed: {
    isReplaceFaqAnalyse() {
      return this.viewSetting.snToUrl && this.viewSetting.snToUrl['faqAnalyse'];
    },
    // 是否展示高级筛选
    showAdvanceFilter() {
      const flag = (this.viewSetting.showFaqTime && !this.config.isKnowledgeBase) ||
        (this.config.needDimensionFilter && this.allAnswerTypeExist) ||
        (this.config.needEffectiveRangeFilter && this.allAnswerTypeExist);

      return flag;
    },
    allAnswerTypeExist() {
      const arr = this.$store.state.faqAnswerType.allAnswerType || [];

      return arr.length;
    },
    // 高级筛选格式化以后的值
    advanceFilterFormat() {
      const isNotEmptyArray = function (data) {
        return Array.isArray(data) && data.length;
      };
      const obj = {};
      const cond = this.advanceFilterCond;

      if (typeof cond.validType === 'string' && cond.validType) {
        obj.validType = cond.validType;
      } else {
        if (isNotEmptyArray(cond.beginTimeRange)) {
          obj.beginTimeRange = JSON.stringify(cond.beginTimeRange);
        }
        if (isNotEmptyArray(cond.endTimeRange)) {
          obj.endTimeRange = JSON.stringify(cond.endTimeRange);
        }
        obj.fromInfo = cond.fromInfo; // id
        obj.fromType = cond.fromType; // 知识点抽取的来源
      }
      obj.answerRules = cond.answerRules;
      Object.assign(obj, {
        'client': cond.client === 'clear' ? '' : cond.client,
        'labels': cond.labels === 'clear' ? '' : cond.labels,
        'eid': cond.eid === 'clear' ? '' : cond.eid,
        'cid': cond.cid === 'clear' ? '' : cond.cid,
        'faq-client': cond['faq-client'] === 'clear' ? '' : cond['faq-client'],
        'faq-labels': cond['faq-labels'] === 'clear' ? '' : cond['faq-labels'],
        'faq-eid': cond['faq-eid'] === 'clear' ? '' : cond['faq-eid'],
        'faq-cid': cond['faq-cid'] === 'clear' ? '' : cond['faq-cid']
      });

      return obj;
    },
    ...Vuex.mapGetters(['ctrlAuth', 'navAuth']),
    ...Vuex.mapState({
      'currentTenantName': (state) => state.currentBizInfo.currentTenantName
    }),
    hasTenant() {
      return this.viewSetting.isTenantBiz && this.config.isTenant;
    },
    // 有多租户公共库编辑权限
    hasEditPublic() {
      if (this.hasTenant) { // 多租户情况下才需要判断多租户公共库编辑权限
        return Boolean(this.ctrlAuth['faqLib:editPublic']);
      } // 非多租户情况下，则为拥有编辑faq库权限
      return true;
    },
    // 有编辑权限
    hasEdit() {
      const authKey = `${this.config.authKeyPrefix}:edit`;

      if (this.config.authKeyPrefix === 'faqLib' && this.hasTenant && !this.currCategoryIsPrivate) { // 多租户情况下，公共FAQ库编辑需要受多租户公共库编辑权限控制
        return Boolean(this.ctrlAuth[authKey] && this.hasEditPublic);
      }
      return Boolean(this.ctrlAuth[authKey]);

    },
    // 有导入权限
    hasImport() {
      const authKey = `${this.config.authKeyPrefix}:import`;

      if (this.config.authKeyPrefix === 'faqLib' && !this.currCategoryIsPrivate) { // 公共FAQ库导入需要受多租户公共库编辑权限控制
        return Boolean(this.ctrlAuth[authKey] && this.hasEditPublic);
      }
      return Boolean(this.ctrlAuth[authKey]);

    },
    // 有导出权限
    hasExport() {
      const authKey = `${this.config.authKeyPrefix}:export`;

      return Boolean(this.ctrlAuth[authKey]);
    },
    // 有批量操作权限
    hasMultiOperate() {
      const authKey = `${this.config.authKeyPrefix}:groupOperation`;

      return Boolean(this.ctrlAuth[authKey]);
    },
    // 有删除权限
    hasDelete() {
      const authKey = `${this.config.authKeyPrefix}:delete`;

      if (this.config.authKeyPrefix === 'faqLib' && this.hasTenant && !this.currCategoryIsPrivate) { // 多租户情况下，公共FAQ库删除需要受多租户公共库编辑权限控制
        return Boolean(this.ctrlAuth[authKey] && this.hasEditPublic);
      }
      return Boolean(this.ctrlAuth[authKey]);

    },
    // 有编辑分类权限
    hasEditCategory() {
      const authKey = `${this.config.authKeyPrefix}:editCategory`;

      if (this.config.authKeyPrefix === 'faqLib' && this.hasTenant && !this.currCategoryIsPrivate) { // 多租户情况下，公共FAQ库分类编辑需要受多租户公共库编辑权限控制
        return Boolean(this.ctrlAuth[authKey] && this.hasEditPublic);
      }
      return Boolean(this.ctrlAuth[authKey]);

    },
    // 有设置用户组权限
    hasEditUserGroup() {
      const authKey = `${this.config.authKeyPrefix}:editUserGroup`;

      return Boolean(this.ctrlAuth[authKey]);
    },
    // 多租户业务编辑Faq弹窗标题需要做拼接
    editFaqDialogTitle() {
      if (this.hasTenant && this.editFaqMod === 'private') {
        return this.$t('faq.faqLibrary.faqLibrary.editPrivateAnswer', { 'tenantName': this.currentTenantName });
      }
      return this.$t('faq.faqLibrary.faqLibrary.editQuestion');
    },
    // 导入FAQ按钮文案
    importFaqButtonText() {
      let textKey = 'import';

      if (this.hasTenant) {
        textKey = this.currCategoryIsPrivate ? 'importPrivate' : 'importPublic';
      }
      return this.$t(`faq.faqLibrary.faqLibrary.${textKey}`);
    },
    // 新建FAQ按钮文案
    addFaqButtonText() {
      if (this.config.isProcessIntentType) {
        return this.$t('missionScene.processIntention.processIntentionKnowledge');
      }

      let textKey = 'new';

      if (this.hasTenant) {
        textKey = this.currCategoryIsPrivate ? 'newPrivate' : 'newPublic';
      }
      return this.$t(`faq.faqLibrary.faqLibrary.${textKey}`);
    },
    // 多个请求会用到的参数，包括faqType和isPublic
    commonParams() {
      return {
        'faqType': this.config.faqType,
        'isPublic': this.currCategoryIsPrivate ? 0 : 1
      };
    },
    // 导入文件的url，需要拼接参数
    uploadAction() {
      return `/api/faq/upload?faqType=${this.commonParams.faqType}&isPublic=${this.commonParams.isPublic}`;
    },
    // 搜索faq的类型searchKey
    allSearchKey() {
      const { config } = this;
      const { showFaqRelevance, hasRelatedQuestions } = this.viewSetting;
      const searchKeys = [{ 'value': 'all', 'label': this.$t('common.commonNoun.all') },
        { 'value': 'question', 'label': this.$t('common.bizNoun.faqQuestion') },
        { 'value': 'answer', 'label': this.$t('common.bizNoun.faqAnswer'), 'isHide': config.noAnswer },
        { 'value': 'relate', 'label': this.$t('common.bizNoun.relateQuestion'), 'isHide': !(showFaqRelevance || hasRelatedQuestions) || config.noRelate },
        { 'value': 'similar', 'label': this.$t('common.bizNoun.similarQuestion') },
        { 'value': 'grammerTemplate', 'label': this.$t('common.bizNoun.grammerTemplate'), 'isHide': config.noGrammerTemplate },
        { 'value': 'customParameters', 'label': this.$t('common.bizNoun.customParameters'), 'isHide': config.noCustomParameters },
        { 'value': 'answerType', 'label': this.$t('common.bizNoun.answerType'), 'isHide': config.noAnswerType }
      ];

      return searchKeys.filter((key) => !key.isHide);
    },
    // 搜索faq的input的占位符
    searchInputPlaceholder() {
      const strMap = constants.SEARCH_KEY_PLACEHOLDER;

      return strMap[this.filterCond.searchKey];
    },
    // 分类树数据
    allCateData() {
      // 多租户业务需要添加两个虚拟顶级分类
      if (this.hasTenant) {
        return [{
          'id': rootMsg.private.id,
          'name': rootMsg.private.name,
          'sub': this.privateCateData,
          'faqCount': this.privateFaqNum,
          'isPrivate': true
        }, {
          'id': rootMsg.public.id,
          'name': rootMsg.public.name,
          'sub': this.cateData,
          'faqCount': this.publicFaqNum,
          'disabled': !this.hasEditPublic// 多租户业务需要权限编辑公共分类
        }];
      }
      return this.cateData;
    },
    currentCateData() {
      if (this.hasTenant) {
        const filterId = this.currCategoryIsPrivate ? rootMsg.private.id : rootMsg.public.id;

        return this.allCateData.filter((item) => item.id === filterId);
      }
      return this.cateData;
    },
    statusFilter() {
      const map = constants.FAQ_STATUS_FILTER_MAP;

      return Object.keys(map).map((item) => ({
        'text': item,
        'value': map[item] instanceof Array ? map[item].join(',') : map[item]
      })); // value不能是数组,这里将数组转换为字符串。
    },
    headers() {
      return Object.assign({
        [constant.CSRF_HEADER_NAME]: getCookie(constant.CSRF_COOKIE_NAME)
      }, this.$http.defaults.headers.common);
    },
    advanceFilterActive() {
      const isNotEmptyArray = function (data) {
        return Array.isArray(data) && data.length;
      };

      const cond = this.advanceFilterCond || {};

      if (
        (typeof cond.validType === 'string' && cond.validType) ||
        isNotEmptyArray(cond.beginTimeRange) ||
        isNotEmptyArray(cond.endTimeRange) ||
        cond.fromInfo ||
        (cond.client && (cond.client !== 'clear')) ||
        (cond.labels && (cond.labels !== 'clear')) ||
        (cond.eid && (cond.eid !== 'clear')) ||
        (cond.cid && (cond.cid !== 'clear')) ||
        (cond['faq-client'] && (cond['faq-client'] !== 'clear')) ||
        (cond['faq-labels'] && (cond['faq-labels'] !== 'clear')) ||
        (cond['faq-eid'] && (cond['faq-eid'] !== 'clear')) ||
        (cond['faq-cid'] && (cond['faq-cid'] !== 'clear'))
      ) {
        return true;
      }

      return false;
    }
  },
  data() {
    const routeObj = this.$route;
    const typeName = routeObj.params.type ?
      `${routeObj.name}-${routeObj.params.type}` :
      routeObj.name;
    const config = constants.ROUTENAME_CONFIG_MAP[typeName];
    const { statusName } = config;

    let status = {};
    const statusStorage = window.sessionStorage.getItem(statusName);
    const mouteStore = this.$route.query;
    // 若是链接带了筛选,优先使用链接带的参数

    if (mouteStore.question) {
      status.text = mouteStore.question;
    } else if (statusStorage) {
      status = JSON.parse(window.sessionStorage.getItem(statusName));
    }
    return {
      'unlinkFaq': null, // 是否解除关联
      'linkedFaqs': [], // 需要下线并且被其他知识点关联的faq
      'tablePoperFaqId': '', // 暂存表格行 id 字段
      'tablePoperData': {
        // 表格7日统计数据
        'hit': 0,
        'like': 0,
        'dislike': 0
      },
      'speach': { // 生效失效话术内容
        'effectBeforeAnswer': '',
        'effectAfterAnswer': ''
      },
      'relevanceData': {
        'showRelevance': false,
        'rows': [],
        'faqMap': constants.FAQ_TYPE_CONFIG_MAP,
        'multi': false, // 是否是多选框
        'loading': false,
        'operteFaqs': [] // 当前操作的faq
      },
      'speachWay': false,
      'globalSpeachStatus': false, // 全局话术状态 true: 已生效 false: 审核中
      'multiOperation': false,
      'multiUpdateOption': { 'showConfirmModel': false, 'opType': 'on' },
      'multipleSelection': [],
      'categoryConclude': [], // 搜索结果
      config, // 页面配置,寒暄faq时会有此属性
      'bId': window.location.pathname.split('/')[2],
      'exportLoading': false, // 下载等操作时的全屏loading
      'createCateModal': false,
      viewSetting,
      'faqData': [],
      'faqCount': 0, // 所有faq数量
      'cateData': [],
      'publicFaqNum': '-', // 多租户业务公共库faq数量
      'privateCateData': [], // 多租户业务私有知识库全部分类
      'privateFaqNum': '-', // 多租户业务私有库faq数量
      'cateName': '',
      'importDialog': false,
      'taskImportDialog': false, // 任务型导入确认弹框
      'taskExportDialog': false, // 任务型导出确认弹框
      'processIntentAdd': false, // 新增流程意图弹框
      'operatorType': 'add',
      'processIntentImportDialog': false, // 流程意图导入弹框
      'processIntentForm': {},
      'sortCond': status.sortCond || {
        'orderColumn': 'updatedAt',
        'order': 'DESC'
      },
      'filterCond': status.filterCond || {
        'pageSize': 10,
        'pageNo': 1,
        'text': status.text || '',
        'status': [],
        'searchKey': 'all'
      },
      'lastFilterCond': {
        'text': '',
        'searchKey': 'all'
      }, // text和searchKey不是改动即生效，所以需要保存上次搜索用到的
      'currCatoryId': status.currCatoryId || rootMsg.default.id,
      'currentCatoryName':
        status.currentCatoryName ||
        this.$t('faq.faqLibrary.faqLibrary.allCategories'),
      'currCategoryIsPrivate': status.currCategoryIsPrivate, // 当前选择分类是否为私有分类
      'file': {},
      'uploadStatus': 10, // 10初始状态,20上传成功,30上传失败,40导入中,50导入成功
      'uploadErrorStatus': 10, // 1010文件格式错误,1020文件内容校检错误,1030其它错误
      'errorDetailFile': '#',
      'ifEdictSimilars': false,
      'faqForSimilarEdit': null,
      'ifEditTemplate': false, // 句法模板编辑侧滑弹窗
      'faqForTemplate': null, // 句法模板点击获取当前的faq
      'ifCreateFaq': false,
      'ifEditFaq': false,
      'editFaqMod': 'all', // 编辑faq弹窗的状态
      'faqForEdit': null, // 传入编辑faq组件的faq的id
      'editCompConfig': {
        'similarRec': false
      },
      'deleteConfirm': false,
      'deleteFaqId': 0,
      'faqRelevance': [], // 下线时提示faq关联内容
      'offlineErrorModal': false,
      'offlineConfirmModal': false,
      'offlineFaqId': null,
      'ifAdvanceFilter': false,
      'advanceFilterCond': status.advanceFilterCond || {
        'validType': '',
        'beginTimeRange': [],
        'endTimeRange': [],
        'fromInfo': null, // id
        'fromType': 1, // 知识点抽取的来源
        'answerRules': '',
        'client': '',
        'labels': '',
        'eid': '',
        'cid': '',

        'faq-client': '',
        'faq-labels': '',
        'faq-eid': '',
        'faq-cid': ''
      },
      'searchCategoryObj': null,
      'flattenCate': [], // 去平分类
      'isComponentDestroy': true, // 页面是否已被销毁，用于清除循环调用的setTimeout
      'groupIncludeMe': {}, // 每个用户组是否包含自己
      'cateGroup': { // 每个分类的权限
        'all': {},
        'cur': {},
        'curUser': {}
      },
      'groupOptions': [], // 用户组列表
      'faqSimilarRepeatedNum': 0, // 相似问导入,重复的数量
      'editLeadingWordDialogVisible': false, // 编辑引导语、脚注弹窗显示状态
      'dictionariesData': {
        'cateList': { '110': [], '120': [], '130': [], '140': [] },
        'dictionaries': {},
        'cateName': {},
        'faqValue': {}
      } // 组标签数据
    };
  },
  'watch': {
    importDialog(val) {
      if (val === true && this.$refs.faqUpload) {
        this.$refs.faqUpload.clearFiles();
      }
    },
    'cateData': {
      handler(val) {
        this.flattenCate = this.flattenMath(val);
      },
      'deep': true,
      'immediate': true
    }
  },
  'filters': {
    status(value) {
      return constants.FAQ_STATUS_MAP[value];
    },
    moment(value) {
      return moment(value).format('YYYY-MM-DD HH:mm');
    }
  },
  'methods': {
    async getcate() {
      const result = await this.$http.get('/api/label/cate');

      this.dictionariesData = result.data.data;
    },
    multiEdit() {
      this.editLeadingWordDialogVisible = true;
    },
    toFaqAnalyseFn(id, type) {
      if (this.isReplaceFaqAnalyse && type === 'click') {
        window.open(`#/business/iframeView/faqAnalyse?faq_id=${id}`, '_blank');
      }
      if (!this.isReplaceFaqAnalyse && type === 'mouseenter') {
        this.tablePoperFaqId = id;
        this.get7DayData();
      }
    },
    // 获取权限，这里主要是hack处理，因为任务型权限放到了bot产品这边设置，而不是从aiforce端,所以需要与其他知识库权限区分开
    // rights为其他知识库的权限，taskRightsKey为任务型的权限的名，如新增MISSION_SCENE_INSERT、删除MISSION_SCENE_DELETE、编辑MISSION_SCENE_UPDATE
    getRights(rights, taskRightsKey) {
      const { authKeyPrefix } = this.config;

      return authKeyPrefix === 'taskType' ? (Role.rights && Role.rights.includes(taskRightsKey)) : rights;
    },
    /**
* @description 计算分类属性
*/
    flattenMath(val) {
      const result = [];

      function flattenInner(val) {
        for (const item of val) {
          result.push(item);
          if (item.sub && item.sub.length) {
            flattenInner(item.sub);
          }
        }
        return result;
      }
      return flattenInner(val);
    },
    /**
* @description 分类排序
*/
    sortSubCate() {
      if (this.$refs.typeTreeComponent && this.$refs.typeTreeComponent.length) {
        this.$refs.typeTreeComponent[0].operationChose('sort', null, this.cateData);
      } else {
        this.$message.warning(this.$t(
          'faq.faqLibrary.faqLibrary.notAvailable'
        ));
      }
    },
    /**
* @description open dialog add new speach
*/
    async showSpeach() {
      await this.fetchSpeach();
      this.speachWay = true;
    },
    /**
* @description 拉取话术内容和状态
* @param type 操作的类型 1: 全局话术
*/
    async fetchSpeach() {
      this.$http.get('/api/operation/display-data', {
        'params': { 'type': 1 }
      }).then((res) => {
        const { data } = res.body;

        this.globalSpeachStatus = !data.auditing;
        this.speach = data.data || {};
      });
    },
    /**
* @description 设置全局默认话术
*/
    newSpeach() {
      const param = {
        'subcmd': 'push_global_ansewer',
        'data': this.speach,
        'dataType': 'object'
      };

      this.$http.post('/api/dsuConfig', param).then((res) => {
        const result = res.data;

        if (result.code === 1000) {
          this.$message.success('保存成功');
          this.speachWay = false;
          this.speach.effectBeforeAnswer = '';
          this.speach.effectAfterAnswer = '';
        }
      });
    },
    fileOver() {
      this.$message.warning(
        `${this.$t(
          'faq.faqLibrary.faqLibrary.singleFileUploadSupported'
        )}!`
      );
    },
    /**
* @description 清空列表
*/
    fileDelete() {
      this.uploadStatus = 10;
      this.uploadErrorStatus = 10;
      this.linkedFaqs = [];
      this.unlinkFaq = null;
    },
    searchFaq() {
      this.filterCond.pageNo = 1;
      this.sortCond.orderColumn = '';
      this.$refs.multipleTable.clearSort();
      this.getFaq();
    },
    /**
* 新页面打开vue-router
*/
    openNewTab(id, title) {
      const { href } = this.$router.resolve({ 'name': 'faqAnalyse' });

      window.localStorage.setItem('faqId', id);
      window.localStorage.setItem('faqTitle', title);
      window.localStorage.setItem('faqType', this.config.faqType);
      window.localStorage.setItem('startDate', moment().subtract(7, 'd').format('YYYY-MM-DD'));
      window.localStorage.setItem('endDate', moment().subtract(1, 'd').format('YYYY-MM-DD'));
      window.open(`${href}?f=1`, '_blank');
    },
    /**
* 获取7天数据
* @description 当前有500毫秒的频率控制
*/
    'get7DayData': _.debounce(async function () {
      this.tablePoperData = {
        'hit': '-',
        'like': '-',
        'dislike': '-'
      };
      const res = await this.$http.get('/api/faqQuota/getQuotaById', {
        'params': {
          'faqType': this.config.faqType,
          'faqId': this.tablePoperFaqId
        }
      });

      this.tablePoperData = res.body.data;
    }, 100),
    async finishCreateCate(cate) {
      this.createCateModal = false;
      this.initUserGroup();
      this.getCate({ 'currentCate': cate, 'isPublic': !cate.isPirvate });
    },
    searchCategory(value) {
      if (!value) {
        return;
      }
      this.$http
        .get(
          `/api/category/search?faqType=${this.config.faqType
          }&name=${value}`
        )
        .then((res) => {
          this.categoryConclude = res.data.data;
        })
        .catch((e) => {
          throw e;
        });
    },
    /**
*  相似问、模板组件修改保存事件，更新列表faq相关信息
*/
    emmitSaved(val = {}) {
      const { affectedFaqIds, shouldQuit } = val;

      if (shouldQuit) {
        this.ifEdictSimilars = false;
      }
      if (Array.isArray(affectedFaqIds)) {
        const ids = affectedFaqIds.filter((id) => this.faqData.some((faq) => faq.id === id));

        this.updateFaqList(ids, ['status', 'similarsCount', 'templateCount', 'updatedAt']);
      }
      // this.getFaq();
    },
    statusObj(status) {
      return constants.FAQ_STATUS_MAP[status];
    },
    moveToCate(cateId) {
      if (!cateId) {
        return;
      }
      const faqs = this.multipleSelection.map((item) => ({
        'id': item.id,
        'faqType': this.config.faqType
      }));

      this.$http
        .put('/api/faq/publish', {
          'faq': faqs,
          'opType': 'edit',
          'CategoryId': cateId,
          'faqType': this.config.faqType
        })
        .then(
          () => {
            this.getFaq();
            this.getCateFaqCount();
            this.multiOperation = false;
            this.clearSelection();
          },
          (err) => {
            throw err;
          }
        );
    },
    clearSelection() {
      this.multipleSelection = [];
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleUploadProgress() {
      this.uploadStatus = 11;
      this.uploadErrorStatus = 10;
    },
    handleUploadSuccess(response, file) {
      if (response.code === 1000) {
        this.uploadStatus = 20;
        this.uploadErrorStatus = 10;
        this.file = file;
        this.linkedFaqs = response.data.linkedFaqs || [];
      } else {
        if (response.code === -1020) {
          this.errorDetailFile = response.data ? response.data.response : '';
        }
        this.uploadStatus = 30;
        this.uploadErrorStatus = -response.code;
      }
    },
    handleUploadError(err, response) {
      if (response.code === -1020) {
        this.errorDetailFile = response.data;
      }
      this.uploadStatus = 30;
      this.uploadErrorStatus = -response.code;
    },
    clickImportBtn() {
      if (this.config.isMissionType) {
        this.taskImportDialog = true;
      } else if (this.config.isProcessIntentType) {
        this.processIntentImportDialog = true;
      } else {
        this.importDialog = true;
      }
    },
    importData() {
      let data = {};

      if (typeof this.file.response.data === 'string') {
        data = {
          'filePath': this.file.response.data
        };
      }
      if (typeof this.file.response.data === 'object') { // 如果查询到关联问，会返回对象{filepath, linkedFaqs}
        if (this.unlinkFaq === null) { // 判断是否选择了处理方式
          this.$alert('请选择处理方式', '提示', {
            'type': 'warning'
          });
          return;
        }
        data = {
          'filePath': this.file.response.data.filepath,
          'unlinkFaq': this.unlinkFaq
        };
      }
      this.uploadStatus = 40;
      this.$http
        .post('/api/faq/import', data, { 'params': this.commonParams })
        .then((res) => {
          const { data } = res;

          if (data.code > 0) {
            this.uploadStatus = 50;
            if (data.data && data.data.faqSimilarRepeatedNum) {
              this.faqSimilarRepeatedNum = data.data.faqSimilarRepeatedNum;
            } else {
              this.faqSimilarRepeatedNum = 0;
            }
            this.getFaq();
            this.getCate();
            if (this.hasTenant) {
              this.getCate({ 'isPublic': false });
            }
          }
        });
    },
    closeImportDialog() {
      this.importDialog = false;
      this.uploadStatus = 10;
      this.uploadErrorStatus = 10;
      this.linkedFaqs = [];
      this.unlinkFaq = null;
    },
    searchCategoryChange(value) {
      if (value.id) {
        this.cateChange(value.id, value.value, value.tenantId !== 0);
      }
    },
    cateChange(cateId, cateName, isPrivate) {
      if (!cateId || !cateName) {
        return;
      }
      this.filterCond.text = '';
      this.filterCond.pageNo = 1;
      this.currentCatoryName = cateName;
      this.currCatoryId = cateId;
      if (this.currCategoryIsPrivate !== Boolean(isPrivate)) {
        this.currCategoryIsPrivate = Boolean(isPrivate);
        this.multiOperation = false;
      }
      this.getFaq();
    },
    rowClassName(event) {
      return event.status >= 300 ? 'bg-grey-lighter' : '';
    },
    sortChange(event) {
      this.filterCond.pageNo = 1;
      if (event.prop) {
        this.sortCond.orderColumn = event.prop;
        this.sortCond.order = event.order === 'ascending' ? 'ASC' : 'DESC';
      } else {
        this.sortCond = {
          'orderColumn': 'updatedAt',
          'order': 'DESC'
        };
      }
      this.getFaq();
    },
    filterChange() {
      this.filterCond.pageNo = 1;
      this.getFaq();
    },
    //查询分类及数量
    getCate(options = {}) {
      const { currentCate } = options;

      if (currentCate) {
        this.cateChange(currentCate.id, currentCate.name, currentCate.isPrivate);
      }
      const fetchCateArr = [this.fetchCate()];

      if (this.hasTenant) { // 多租户业务需要额外拉取私有分类
        fetchCateArr.push(this.fetchCate({ 'isPublic': false }));
      }
      Promise.all(fetchCateArr).then(() => {
        this.getCateFaqCount();
      });
    },
    fetchCate(options = {}) {
      const { isPublic } = options;
      const params = {
        'faqType': this.config.faqType,
        'isPublic': isPublic === false ? 0 : 1
      };

      return this.$http.get('/api/category', { params }).then((res) => {
        const { data } = res.data;

        if (isPublic === false) {
          this.privateCateData = data;
        } else {
          this.cateData = data;
        }
      });
    },
    getCateFaqCount() {
      this.$nextTick(() => {
        this.allCateData.forEach((item, index) => {
          if (Array.isArray(item.sub) && item.sub.length > 0) {
            this.$refs.typeTreeComponent[index].getCateFaqCount();
            this.$refs.typeTreeComponent[index].setChangeHasCount();
          }
        });
      });
      this.fetchCateFaqCount();
      if (this.hasTenant) {
        this.fetchCateFaqCount({ 'isPublic': false });
      }
    },
    fetchCateFaqCount(options = {}) {
      const { isPublic } = options;
      const cateData = isPublic === false ? this.privateCateData : this.cateData;
      const cate = cateData.map((item) => item.id);

      this.$http({
        'method': 'GET',
        'url': '/api/faq/cate-faq-count',
        'params': {
          'cate': JSON.stringify(cate),
          'faqType': this.config.faqType
        }
      }).then(
        (res) => {
          const { data } = res.body;
          let num = 0;

          cateData.forEach((item, index) => {
            num += data[index];
            this.$set(item, 'faqCount', data[index]);
          });
          if (isPublic === false) {
            this.privateFaqNum = num;
          } else {
            this.publicFaqNum = num;
          }
        }
      );
    },
    getFaq() {
      // 获得所有FAQ
      this.faqData = [];
      const {
        pageNo, pageSize, text, searchKey, status
      } = this.filterCond;

      this.lastFilterCond = {
        'text': this.filterCond.text,
        'searchKey': this.filterCond.searchKey
      }; // 保存拉取列表用到的搜索条件，用于导出时使用
      const CategoryId = this.currCatoryId > 0 ? this.currCatoryId : 0; // 小于0表示根目录
      const params = {
        CategoryId,
        pageNo,
        pageSize,
        text,
        searchKey,
        ...this.advanceFilterFormat
      };

      Object.assign(params, this.commonParams);
      if (this.sortCond) {
        params.orderColumn = this.sortCond.orderColumn;
        params.order = this.sortCond.order;
      }
      if (status instanceof Array && status.length > 0) {
        params.status = status.join(','); // 包含多个状态的筛选项已经是用逗号分隔的数字。
      } else {
        params.status = status;
      }

      this.$http
        .get('/api/faq', {
          params
        })
        .then((res) => {
          this.faqData = res.body.data.rows;
          this.faqCount = res.body.data.count;
          this.checkFaqListStatus();
          if (this.filterCond.pageNo > 1 && !this.faqData.length) {
            this.filterCond.pageNo = 1;
            this.getFaq();
          } // 出现非第一页，而且无数据的情况，将页码跳转至第一页
        });
    },
    // 对于发布中faq需要延迟2s后重新请求并更新状态
    checkFaqListStatus() {
      const ids = this.faqData.filter((faq) => [300, 310, 320].includes(faq.status)).map((faq) => faq.id);

      if (ids.length > 0 && this.isComponentDestroy) { // 页面销毁后不再执行
        setTimeout(() => {
          this.updateFaqList(ids, ['status']);
        }, 2000);
      }
    },
    // 不刷新列表，对faq列表中某几个字段进行更新
    updateFaqList(ids, updateColumns) {
      const params = {
        'pageNo': 1,
        'pageSize': ids.length,
        'ids': JSON.stringify(ids)
      };

      Object.assign(params, this.commonParams);
      this.$http.get('/api/faq', { params })
        .then((res) => {
          let needCheckFlag = false; // 标记是否需要重新检查faq状态
          const result = res.data;

          if (result.code === 1000 && result.data.rows.length > 0) {
            const faqIdMap = result.data.rows.reduce((prev, next) => {
              prev[next.id] = next;
              return prev;
            }, {});

            this.faqData.forEach((faq) => {
              const newFaq = faqIdMap[faq.id];

              if (newFaq) {
                updateColumns.forEach((key) => {
                  faq[key] = newFaq[key];
                  if (key === 'status') {
                    needCheckFlag = true;
                  }
                });
              }
            });
          }
          if (needCheckFlag) {
            this.checkFaqListStatus();
          }
        });
    },
    pageChange(pageNo) {
      this.filterCond.pageNo = pageNo;
      this.getFaq();
    },
    sizeChange(size) {
      this.filterCond.pageSize = size;
      this.filterCond.pageNo = 1;
      this.getFaq();
    },
    createFaq() {
      if (this.config.isMissionType) {
        this.$router.push({ 'name': 'missionDetailNew' });
        return;
      }

      if (this.config.isProcessIntentType) {
        this.processIntentForm = {};
        this.operatorType = 'add';
        this.processIntentAdd = true;
        return;
      }

      this.ifCreateFaq = true;
      this.faqForEdit = null;
    },
    updateFaq(id, opType, status) {
      let isDelRelationVal = false;

      if (opType === 'del') {
        isDelRelationVal = true;
      }
      return this.$http.put('/api/faq/publish', {
        'faq': {
          id,
          'faqType': this.config.faqType,
          status
        },
        opType,
        'isDelRelation': isDelRelationVal
      });
    },
    taskStatistics(id, name) {
      this.$router.push({ 'name': 'missionStatistics', 'params': { 'missionId': id, 'missionName': name } });
    },
    multiUpdateFaq(opType) {
      this.multiUpdateOption = {
        'showConfirmModel': true,
        opType
      };
    },
    cancelMultiUpdate() {
      this.multiUpdateOption = {
        'showConfirmModel': false,
        'opType': 'on'
      };
    },
    /**
* @description 显示关联问下线 警告
*/
    showRelevanceTip(err) {
      const { relevanceErr } = constants.OPERATE_ERROR_CODE_MAP;
      const { data, hideNormalError } = err;

      if (data && (data.code === relevanceErr) && (data.data.response instanceof Array) &&
        data.data.response.length) {
        hideNormalError && hideNormalError();
        this.relevanceData.rows = data.data.response;
        this.relevanceData.showRelevance = true;
      }
    },
    forceOffline() {
      this.relevanceData.showRelevance = false;
      this.relevanceData.multi = false;
      this.relevanceData.loading = false;
      this.relevanceData.operteFaqs = [];
      this.clearSelection();
      this.multiOperation = false;
    },
    offlineAndRelationDeal(isSave) {
      let isDelRelation = true;

      if (isSave === 'save') {
        isDelRelation = false;
      }
      this.relevanceData.loading = true;
      this.$http
        .put('/api/faq/publish', {
          'faq': this.relevanceData.operteFaqs,
          'opType': 'off',
          'pass': true,
          'isDelRelation': isDelRelation
        })
        .then(() => {
          this.forceOffline();
          this.getFaq();
        })
        .catch(() => {
          this.forceOffline();
        });
    },
    multiUpdateFaqConfirm() {
      const { opType } = this.multiUpdateOption;

      this.cancelMultiUpdate();
      if (this.multipleSelection.length === 0) {
        return;
      }
      const faqs = this.multipleSelection.map((item) => ({
        'id': item.id,
        'faqType': this.config.faqType,
        'status': item.status
      }));

      this.relevanceData.multi = true;
      this.relevanceData.operteFaqs = faqs;

      let isDelRelationVal = false;

      if (opType === 'del') {
        isDelRelationVal = true;
      }

      this.$http
        .put('/api/faq/publish', {
          'faq': faqs,
          opType,
          'isDelRelation': isDelRelationVal
        })
        .then(() => {
          this.getFaq();
          if (opType === 'del') {
            this.getCateFaqCount();
          }
          this.clearSelection();
          this.multiOperation = false;
        })
        .catch((err) => {
          this.getFaq();
          this.clearSelection();
          this.multiOperation = false;
          this.showRelevanceTip(err);
        });
    },
    cancel(id) {
      this.updateFaq(id, 'cancel').then(() => {
        this.getFaq();
      });
    },
    repub(id) {
      this.updateFaq(id, 'pass').then(() => {
        this.getFaq();
      });
    },
    offlineConfirm(faq) {
      if (faq.reserve4) {
        this.offlineConfirmModal = true;
        this.offlineFaqId = faq.id;
      } else {
        this.offline(faq.id, faq.status);
        this.relevanceData.multi = false;
        this.relevanceData.operteFaqs = [{
          'id': faq.id,
          'faqType': this.config.faqType,
          'status': faq.status
        }];
      } // 有关联的子节点时,弹窗提示,下线将取消关联
    },
    online(id) {
      this.updateFaq(id, 'on').then(() => {
        this.getFaq();
      });
    },
    offline(id, status) {
      this.updateFaq(id, 'off', status)
        .then(() => {
          this.getFaq();
        })
        .catch((err) => {
          this.showRelevanceTip(err);
        });
    },
    exportConfirm() {
      this.taskExportDialog = true;
    },
    download(mixin = {}) {
      this.exportLoading = true;
      const params = Object.assign({
        'CategoryId': this.currCatoryId > 0 ? this.currCatoryId : 0,
        'text': this.lastFilterCond.text,
        'searchKey': this.lastFilterCond.searchKey,
        ...this.advanceFilterFormat
      }, this.commonParams);

      if (this.sortCond) {
        params.orderColumn = this.sortCond.orderColumn || 'updatedAt';
        params.order = this.sortCond.order || 'DESC';
      }
      if (
        this.filterCond.status instanceof Array &&
        this.filterCond.status.length > 0
      ) {
        params.status = this.filterCond.status.join(',');
      } else {
        params.status = this.filterCond.status;
      }
      if (
        Array.isArray(this.multipleSelection) &&
        this.multipleSelection.length
      ) {
        params.idArr = JSON.stringify(
          this.multipleSelection.map((item) => item.id)
        );
      }

      let url = '/api/faq/export';
      const { exportMes } = mixin;

      if (this.config.faqType === TYPE_MISSION) { // 任务型
        url = '/api/missionScene/export';

        // 任务图
        if (exportMes && exportMes.includes('exportTask')) {
          params.exportTask = 'true';
        }
        // 相似问句与句法模板
        if (exportMes && exportMes.includes('exportSimilarAndPattern')) {
          params.exportSimilarAndPattern = 'true';
        }
        // 任务图关联信息
        if (exportMes && exportMes.includes('exportSlots')) {
          params.exportSlots = 'true';
        }
        if (exportMes && exportMes.includes('exportProcessIntents')) {
          params.exportProcessIntents = 'true';
        }
      } else {
        // 主体内容
        const exportMainBody = exportMes && exportMes.includes('exportMainBody');

        params.exportMainBody = Number(exportMainBody);

        // 相似问句与句法模板
        const exportSimilarAndPattern = exportMes && exportMes.includes('exportSimilarAndPattern');

        params.exportSimilarAndPattern = Number(exportSimilarAndPattern);

        if (this.config.faqType === TYPE_FAQ || this.config.faqType === TYPE_GREETING) { // faq和寒暄需要增加整体概览
          // 整体数据概览
          const exportOverview = exportMes && exportMes.includes('exportOverview');

          params.exportOverview = Number(exportOverview);
        }
      }

      this.$http
        .get(url, {
          params
        })
        .then((res) => {
          this.exportLoading = false;
          if (res.body.code > 0) {
            const { data } = res.body;

            if (Array.isArray(data)) { // 多个下载链接
              data.forEach((item) => {
                downloadFileByUrl(item.downloadLink);
              });
            } else { // 单个下载链接
              window.location.href = data.downloadLink;
            }
            this.taskExportDialog = false;
          }
        });
    },
    downloadTemplate() {
      const url = '/api/faq/template';

      this.$http
        .get(url, {
          'params': {
            'isKnowledgeBase': this.config.isKnowledgeBase,
            'faqType': this.config.faqType
          }
        })
        .then((res) => {
          if (res.body.code === 1000) {
            window.location.href = res.body.data.downloadLink;
          }
        });
    },
    downloadSimilarTemplate() {
      const url = '/api/similar/template';

      this.$http.get(url).then((res) => {
        if (res.body.code === 1000) {
          window.location.href = res.body.data.downloadLink;
        }
      });
    },
    /**
* @description 编辑句法模板
* @param {faq} 当前faq
*/
    editTemplate(faq) {
      this.faqForTemplate = faq;
      this.ifEditTemplate = true;
    },
    editSimilars(faq) {
      this.faqForSimilarEdit = faq;
      this.ifEdictSimilars = true;
    },
    editFaq(faq) {
      // 如果为任务型，则进入任务图页面
      if (this.config.isMissionType) {
        this.$router.push({ 'name': 'missionDetail', 'params': { 'faqId': `${faq.id}` } });
        return;
      }

      if (this.config.isProcessIntentType) {
        this.processIntentForm = faq;
        this.operatorType = 'edit';
        this.processIntentAdd = true;
        return;
      }

      this.faqForEdit = faq.id;
      this.ifEditFaq = true;
      if (!this.hasEditPublic && !this.currCategoryIsPrivate) {
        // 如果是公共库且没有公共库编辑权限，则只能对公共库编辑属于自己的答案
        this.editFaqMod = 'private';
      } else {
        this.editFaqMod = 'all';
      }
    },
    changeFaqEditorMod(mod) {
      this.$refs.faqEditorComponent.changeMod().then(() => {
        this.editFaqMod = mod;
      }).catch(() => { });
    },
    deleteFaq(faqId) {
      this.deleteConfirm = true;
      this.deleteFaqId = faqId;
    },
    remove(id) {
      this.updateFaq(id, 'del').then(() => {
        this.deleteConfirm = false;
        this.deleteFaqId = null;
        this.getCateFaqCount();
        this.getFaq();
      });
    },
    changeAdvanceFilter(val) {
      this.advanceFilterCond = val;
      this.filterCond.pageNo = 1;
      this.ifAdvanceFilter = false;
      this.getFaq();
    },
    getRole() {
      if (typeof role === 'undefined') {
        return this.$http.get('/basic/user/role').then((res) => {
          const { data } = res;

          if (data.code === 1000) {
            role = data.data.role === 1;
          }
        });
      }
      return Promise.resolve();

    },
    initUserGroup() {
      // 请求分类树的权限
      Promise.all([this.getCateGroup(), this.getGroupOptions(), this.getRole()])
        .then((arr) => {
          const [cateGroup, groupOptions] = arr;
          const { id } = cateGroup.curUser;
          // 每个用户组相对自己是否有权限
          const groupIncludeMe = groupOptions.reduce((obj, options) => {
            obj[options.id] = role || options.members.findIndex((v) => v.id === id) > -1;
            return obj;
          }, {});

          this.groupOptions = groupOptions;
          this.cateGroup = cateGroup;
          this.groupIncludeMe = groupIncludeMe;
        }).catch((e) => {
          console.log(e);
        });
    },
    getCateGroup() {
      return this.$http.get(`/api/category/user-groups/${this.config.faqType}`).then((res) => {
        const { data } = res;

        if (data.code === 1000) {
          return data.data;
        }
      });
    },
    getGroupOptions() {
      return this.$http.get('/api/app/user-groups').then((res) => {
        const { data } = res;

        if (data.code === 1000) {
          return data.data;
        }
      });
    }
  },
  beforeMount() {
    this.getCate({ 'isPublic': true });
    if (this.hasTenant) {
      // 从日志跳转过来时，isPrivate字段为2则选中私有库根目录
      if (mouteStore.isPrivate === '2') {
        this.currCatoryId = rootMsg.private.id;
        this.currentCatoryName = rootMsg.private.name;
        this.currCategoryIsPrivate = true;
      }
      // 多租户情况下如果默认分类为全部分类，则修改分类为公共库根目录
      if (this.currCatoryId === rootMsg.default.id) {
        this.currCatoryId = rootMsg.public.id;
        this.currentCatoryName = rootMsg.public.name;
      }
    }
    this.getFaq();
    this.getcate();
  },
  destroyed() {
    this.$store.commit(types.BOTLOG_SEARCH_CONTENT);
    this.isComponentDestroy = false;
    const status = {
      'currentCatoryName': this.currentCatoryName,
      'currCategoryIsPrivate': this.currCategoryIsPrivate,
      'currCatoryId': this.currCatoryId,
      'filterCond': this.filterCond,
      'sortCond': this.sortCond,
      'advanceFilterCond': this.advanceFilterCond
    };

    window.sessionStorage.setItem(
      this.config.statusName,
      JSON.stringify(status)
    );
  }
};
</script>

<style lang="less">
@import "~asset/css/vars.less";

.faq-libirary-tooltip__popper.el-tooltip__popper.is-light {
  padding: 0;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25);
  border: none;
}
.faq-libirary-tooltip-container {
  width: 160px;
  text-align: center;
  .tooltip-header {
    background-color: @grey-color-3;
    line-height: 45px;
    color: @color-white;
  }
  .tooltip-body {
    padding: 5px 0;
  }
  .tooltip-footer {
    padding: 10px 0;
    border-top: 1px solid @grey-color-9;
  }
  .el-table .cell {
    padding-left: 0;
  }
  .data-lists {
    display: inline-block;
    text-align: left;
    li {
      line-height: 20px;
      .data-text {
        color: @grey-color-6;
        padding-right: 10px;
      }
      .data-num {
        font-weight: bold;
      }
    }
  }
} // 用于tooltip样式，tooltip是加在body上的
#faq-library-container {
  background-color: #f6f6f6;
  overflow-y: hidden;
  height: 100%;
  .relevance-tip {
    font-size: 14px;
    font-weight: normal;
    margin-bottom: 10px;
  }
  .operation-dialog {
    width: 100%;
    &:last-of-type {
      margin-top: 30px;
    }
    &:first-of-type {
      margin: 0;
    }
    .el-cascader {
      width: 100%;
    }
    .el-input {
      width: 100%;
    }
    &__title {
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 14px;
      color: @color-dimgrey-dark;
    }
  }
  .margin-left6 {
    margin-left: 6px;
  }
  .faq__speach--status {
    margin-bottom: 12px;
  }
  .faq__speach--status,
  .faq__speach--tittle {
    font-weight: normal;
    font-size: 14px;
  }
  .speach-content {
    margin: 10px 0px 12px 0px;
  }
  .speach-icon {
    font-size: 14px;
    color: #979797;
    cursor: pointer;
  }
  .faq-upload {
    .el-dialog {
      width: 510px;
    }
  }
  .el-dialog__body {
    padding: 30px;
  }
  .el-upload-list__item {
    margin-top: -14px;
    margin-bottom: 10px;
  }
  .info-text {
    & > p {
      margin-bottom: 8px;
    }
    font-size: 12px;
    color: @color-grey-dark;
    line-height: 12px;
  }
  .normal-title {
    font-size: 16px;
    color: @color-dimgrey-light;
    line-height: 22px;
    font-weight: normal;
    margin-bottom: 14px;
  }
  .el-dialog__header {
    padding: 18px 30px;
    font-size: 18px;
    color: @color-dimgrey-light;
  }
  .el-upload {
    width: 100%;
  }
  .el-upload-dragger {
    width: 100%;
    height: 150px;
    background: @color-ghostwhite-light;
    margin-bottom: 14px;
  }
  .el-upload__text {
    font-size: 12px;
    color: @color-grey-dark;
    padding-top: 10px;
    line-height: 18px;
  }
  .faq-extraction__upload--icon {
    display: inline-block;
    line-height: 44px;
    font-size: 12px;
    color: #172633;
    border-radius: 100px;
    background: #ffffff;
    border: 1px solid #f0f0f0;
    width: 140px;
    margin-top: 36px;
  }
  .icon-chouqurenwu::before {
    font-size: 24px;
    color: @primary-color;
    display: inline-block;
    position: relative;
    top: 4px;
  }
  .y-pagination {
    width: auto;
  } // 覆盖width:100%。
  .iconfont {
    cursor: pointer;
  }
  .hover-active:hover {
    color: @color-active;
  }
  .faq-status {
    white-space: nowrap;
    border-radius: 13px;
    display: inline-block;
    font-size: 12px;
    line-height: 26px;
    max-width: calc(100% - 16px);
    padding: 0 8px;
    &.faq-state-success {
      background-color: rgba(214, 244, 230, 0.4);
    }
    &.faq-state-grey {
      background-color: rgba(231, 233, 235, 0.4);
    }
    &.faq-state-warn {
      background-color: rgba(255, 242, 221, 0.4);
    }
    &.faq-state-danger {
      background-color: rgba(249, 222, 224, 0.4);
    }
    & > span {
      display: inline-block;
      width: 80%;
    }
  }
  .faq-library-left {
    box-sizing: border-box;
    position: relative;
    height: 100%;
    width: 220px;
    padding: 0 16px;
    background-color: @color-white;
    .faq-library-left-title {
      line-height: 60px;
    }
    .cate-title {
      line-height: 24px;
    }
    .search-cate-input {
      padding: 0 0 4px 0;
    }
    .type-tree-lists {
      position: absolute;
      overflow-y: auto;
      top: 134px;
      bottom: 20px;
      right: 0;
      left: 12px;
      &.type-tree-lists-less-top {
        top: 94px;
      }
      // margin-right: 12px;
    }
    .faq-library-cate {
      .add-icon {
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        text-align: center;
        color: @grey-color-6;
        line-height: 16px;
      }
      .cate-list__title {
        width: 100%;
        height: 40px;
      }
      .all-cate-item {
        line-height: 40px;
      }
    }
    .checked-text {
      color: @color-active;
      font-weight: bold;
    }
  }
  .faq-library-right {
    height: 100%;
    width: calc(~"100% - 220px");
    padding: 0 20px;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .title-container {
    line-height: 32px;
    padding: 40px 0 20px 0;
  }
  .right-body {
    background-color: @color-white;
  }
  .body-title-container,
  .faq-table-footer {
    padding: 20px 30px;
    .iconfont {
      line-height: 30px;
    }
    .search-input {
      width: 340px;
    }
    .search-select {
      width: 120px;
    }
    .operate-container {
      height: 32px;
      .el-select {
        width: 130px;
      }
    }
  }
  .faq-table-container {
    overflow: auto;
  }
  .faq-table-header {
    background-color: @color-ghostwhite-normal;
  }
  .faq-table-tip {
    height: 20px;
    line-height: 20px;
    padding-bottom: 10px;
  }
  .u-click1 {
    vertical-align: top;
    border: 1px solid #e4e7e8;
    text-align: center;
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius: 2px;
    color: @grey-color-6;
    box-sizing: border-box;
    margin-left: 15px;
  }
  .multi-operate-container {
    line-height: 40px;
    :not(:first-child) {
      margin-left: 10px;
    }
    .el-select {
      width: 130px;
    }
  }
  .big-slide {
    .slider-dialog__body {
      width: 680px;
    }
  }
  .header-dialog-title {
    border-bottom: 1px solid #dce1e6;
    padding: 0px 20px;
    box-sizing: border-box;
    height: 60px;
    line-height: 60px;
    .header-dialog-content {
      font-size: @font-huge;
      font-weight: bold;
      height: inherit;
      line-height: inherit;
    }
  }
  .header-dialog-title-once {
    border-bottom: 1px solid #dce1e6;
    padding: 0px 20px;
    box-sizing: border-box;
    height: 60px;
    line-height: 60px;
    display: flex;
    align-items: center;
    .header-dialog-content-once {
      font-size: @font-huge;
      font-weight: bold;
      height: inherit;
      line-height: inherit;
      display: inline-block;
    }
    .header-dialog-grammar {
      display: inline-block;
      max-width: 300px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .header-dialog-content {
    font-family: "PingFangSC-Regular";
    font-weight: normal;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0.35px;
  }
  .dialog-body {
    position: absolute;
    top: 10px;
    padding: 0px 30px;
    overflow-y: auto;
    box-sizing: border-box;
    bottom: 60px;
    width: 100%;
  }
  .slider-dialog__container .dialog-footer {
    position: absolute;
    bottom: 20px;
    height: 34px;
  }
}
.faqSimilarRepeated {
  color: @color-danger;
}
</style>
