import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/types/admin";
import { ProjectStatus, PROJECT_STATUS_OPTIONS } from "@/types/status";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: number;
  fullName?: string;
  full_name?: string;
  email: string;
  avatar?: string;
  joinedProjects?: { id: number; title: string }[];
}

interface Teacher {
  id: number;
  fullName?: string;
  full_name?: string;
  email: string;
}

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    projectId: number,
    data: {
      title: string;
      description: string;
      teacherId: string | number;
      status: string;
      expiredAt: string | Date;
      addStudents: number[];
      removeStudents: number[];
    }
  ) => Promise<void>;
  project: Project | null;
  loading?: boolean;
  teachers?: Teacher[];
  allStudents?: Student[];
  allProjects?: Project[];
}

const getFullName = (item: Teacher | Student) =>
  item.fullName || (item as any).full_name || "Không có tên";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const highlightText = (text: string, search: string) => {
  if (!search.trim()) return text;

  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 text-gray-900 font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function EditProjectDialog({
  open,
  onClose,
  onSave,
  project,
  loading = false,
  teachers = [],
  allStudents = [],
  allProjects = [],
}: EditProjectDialogProps) {
  const MAX_STUDENTS = 4;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState<string>("");
  const [status, setStatus] = useState<ProjectStatus>("pending");
  const [expiredAt, setExpiredAt] = useState("");

  const [projectStudents, setProjectStudents] = useState<Student[]>([]);
  const [addedStudentIds, setAddedStudentIds] = useState<number[]>([]);
  const [removedStudentIds, setRemovedStudentIds] = useState<number[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [teacherOpen, setTeacherOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayLimit, setDisplayLimit] = useState(20);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!project || !open) return;

    setTitle(project.title || "");
    setDescription(project.description || "");
    setTeacherId(project.teacherId?.toString() || "");
    setStatus(project.status || "pending");
    setExpiredAt(formatDateForInput(project.expiredAt));
    setProjectStudents((project as any).students || []);
    setAddedStudentIds([]);
    setRemovedStudentIds([]);
    setShowStudentList(false);
    setSelectedStudentId("");
    setSearchQuery("");
    setDisplayLimit(20);
  }, [project, open]);

  const handleSave = async () => {
    if (!project) return;

    if (expiredAt) {
      const expireDate = new Date(expiredAt);
      const createdDate = new Date(project.createdAt || (project as any).created_at);
      createdDate.setHours(0, 0, 0, 0);
      expireDate.setHours(0, 0, 0, 0);
      
      if (expireDate < createdDate) {
        alert("Ngày hết hạn phải sau ngày tạo đề tài");
        return;
      }
    }

    await onSave(project.id, {
      title,
      description,
      teacherId,
      status,
      expiredAt,
      addStudents: addedStudentIds,
      removeStudents: removedStudentIds,
    });
  };

  const handleAddStudent = () => {
    if (!selectedStudentId) return;

    if (projectStudents.length >= MAX_STUDENTS) {
      return;
    }

    const studentId = parseInt(selectedStudentId);
    const student = allStudents.find((s) => s.id === studentId);

    if (!student || projectStudents.some((s) => s.id === studentId)) return;

    setProjectStudents((prev) => [...prev, student]);
    setRemovedStudentIds((prev) => prev.filter((id) => id !== studentId));
    setAddedStudentIds((prev) =>
      removedStudentIds.includes(studentId) ? prev : [...prev, studentId]
    );
    setSelectedStudentId("");
  };

  const handleRemoveStudent = (studentId: number) => {
    setProjectStudents((prev) => prev.filter((s) => s.id !== studentId));
    setAddedStudentIds((prev) => prev.filter((id) => id !== studentId));
    setRemovedStudentIds((prev) =>
      addedStudentIds.includes(studentId) ? prev : [...prev, studentId]
    );
  };

  const studentsInProjects = useMemo(() => {
    const studentIds = new Set<number>();
    projectStudents.forEach((s) => studentIds.add(s.id));
    return studentIds;
  }, [projectStudents]);

  const availableStudents = useMemo(() => {
    const filtered = allStudents.filter((student) => {
      const inOtherProject = student.joinedProjects?.some(
        (p) => p.id !== project?.id
      );
      return !inOtherProject;
    });

    if (!debouncedSearchQuery.trim()) {
      return filtered.slice(0, displayLimit);
    }

    const query = debouncedSearchQuery.toLowerCase();
    const searchResults = filtered.filter((student) => {
      const name = getFullName(student).toLowerCase();
      const email = student.email.toLowerCase();
      return name.includes(query) || email.includes(query);
    });

    return searchResults.slice(0, displayLimit);
  }, [allStudents, project?.id, debouncedSearchQuery, displayLimit]);

  const handleLoadMore = useCallback(() => {
    setDisplayLimit((prev) => prev + 20);
  }, []);

  const selectedTeacher = teachers.find((t) => t.id.toString() === teacherId);
  const selectedStudent = availableStudents.find(
    (s) => s.id.toString() === selectedStudentId
  );

  const isMaxStudentsReached = projectStudents.length >= MAX_STUDENTS;

  return (
    <Dialog open={open} onOpenChange={onClose} modal={true}>
      {/* Dialog container with comfortable max width and height */}
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 border-gray-200">
        {/* Header - visually lighter with medium font weight */}
        <DialogHeader className="px-6 py-5 border-b border-gray-100">
          <DialogTitle className="text-lg font-medium text-gray-900">
            Chỉnh sửa đề tài
          </DialogTitle>
        </DialogHeader>

        {/* Form content with improved spacing */}
        <div className="space-y-5 py-5 px-6 overflow-y-auto">
          {/* Title field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="title"
              className="text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Tên đề tài
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên đề tài"
              className="h-10 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description field - comfortable textarea height */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-xs font-medium text-gray-500 uppercase tracking-wide"
            >
              Mô tả
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả đề tài"
              rows={4}
              className="border-gray-200 rounded-lg resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status & Date row - consistent alignment */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status dropdown */}
            <div className="space-y-1.5">
              <Label
                htmlFor="status"
                className="text-xs font-medium text-gray-500 uppercase tracking-wide"
              >
                Trạng thái
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as ProjectStatus)}
              >
                <SelectTrigger className="h-10 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                {/* Force dropdown to open downward using position="popper" */}
                <SelectContent position="popper" sideOffset={4}>
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date picker - visually equal to other inputs */}
            <div className="space-y-1.5">
              <Label
                htmlFor="expiredAt"
                className="text-xs font-medium text-gray-500 uppercase tracking-wide"
              >
                Ngày hết hạn
              </Label>
              <Input
                id="expiredAt"
                type="date"
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                min={project?.createdAt ? formatDateForInput(project.createdAt) : formatDateForInput((project as any)?.created_at)}
                className="h-10 border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <Separator className="bg-gray-100" />

          {/* Student Management Section - informational feel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  Sinh viên{" "}
                  <span className="text-gray-400">
                    ({projectStudents.length}/{MAX_STUDENTS})
                  </span>
                </span>
                {isMaxStudentsReached && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-0"
                  >
                    Đã đủ
                  </Badge>
                )}
              </div>
              {/* Secondary button - ghost style, smaller */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowStudentList(!showStudentList)}
                className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 h-8"
              >
                {showStudentList ? "Ẩn danh sách" : "Xem danh sách"}
              </Button>
            </div>

            {showStudentList && (
              <div className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50/50">
                {/* Warning message when max students reached */}
                {isMaxStudentsReached && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                      ⚠️ Đề tài đã đủ {MAX_STUDENTS} sinh viên. Vui lòng xóa bớt
                      sinh viên nếu muốn thêm người khác.
                    </p>
                  </div>
                )}

                {/* Add Student */}
                <div className="flex gap-2">
                  <Popover
                    open={studentOpen}
                    onOpenChange={setStudentOpen}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={studentOpen}
                        className="flex-1 justify-between h-9 text-sm border-gray-200 rounded-lg font-normal"
                        disabled={isMaxStudentsReached}
                      >
                        {selectedStudent
                          ? `${getFullName(selectedStudent)} - ${
                              selectedStudent.email
                            }`
                          : isMaxStudentsReached
                          ? "Đã đủ số lượng sinh viên"
                          : "Chọn sinh viên để thêm"}
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    {/* Force dropdown downward, prevent auto-flip to top */}
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0"
                      align="start"
                      side="bottom"
                      sideOffset={8}
                      avoidCollisions={false}
                    >
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Tìm theo tên hoặc email..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList className="max-h-[300px] overflow-y-auto">
                          <CommandEmpty>
                            {allStudents.length === 0
                              ? "Không có sinh viên nào trong hệ thống"
                              : availableStudents.length === 0 &&
                                !debouncedSearchQuery
                              ? "Tất cả sinh viên đã tham gia project khác"
                              : "Không tìm thấy sinh viên phù hợp"}
                          </CommandEmpty>
                          <CommandGroup>
                            {availableStudents.map((student) => {
                              const isAlreadyInProject = studentsInProjects.has(
                                student.id
                              );
                              const fullName = getFullName(student);

                              return (
                                <CommandItem
                                  key={student.id}
                                  value={student.id.toString()}
                                  onSelect={() => {
                                    if (
                                      !isAlreadyInProject &&
                                      !isMaxStudentsReached
                                    ) {
                                      setSelectedStudentId(
                                        student.id.toString()
                                      );
                                      setStudentOpen(false);
                                      setSearchQuery("");
                                    }
                                  }}
                                  disabled={isAlreadyInProject}
                                  className={cn(
                                    "flex items-center gap-3 py-3 cursor-pointer",
                                    isAlreadyInProject &&
                                      "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.avatar} />
                                    <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                                      {getInitials(fullName)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {highlightText(
                                        fullName,
                                        debouncedSearchQuery
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {highlightText(
                                        student.email,
                                        debouncedSearchQuery
                                      )}
                                    </p>
                                  </div>

                                  {isAlreadyInProject && (
                                    <div className="flex items-center gap-1">
                                      <Check className="h-4 w-4 text-green-600" />
                                      <span className="text-xs text-green-600 font-medium">
                                        Đã chọn
                                      </span>
                                    </div>
                                  )}
                                </CommandItem>
                              );
                            })}
                            {/* Load more button */}
                            {allStudents.length > displayLimit &&
                              availableStudents.length === displayLimit && (
                                <div className="p-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLoadMore}
                                    className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  >
                                    Tải thêm sinh viên...
                                  </Button>
                                </div>
                              )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddStudent}
                    disabled={!selectedStudentId || isMaxStudentsReached}
                    className="h-9 px-3 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm
                  </Button>
                </div>

                <Separator className="bg-gray-100" />

                {/* Student List */}
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {projectStudents.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">
                      Chưa có sinh viên nào
                    </p>
                  ) : (
                    projectStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-2.5 border border-gray-100 rounded-lg bg-white hover:border-gray-200 transition-colors"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="text-xs bg-gray-100 text-gray-600">
                            {getInitials(getFullName(student))}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                            {getFullName(student)}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {student.email}
                          </p>
                        </div>

                        {addedStudentIds.includes(student.id) && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-green-50 text-green-600 border-0"
                          >
                            Mới thêm
                          </Badge>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - clear action hierarchy with spacing */}
        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-5"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
