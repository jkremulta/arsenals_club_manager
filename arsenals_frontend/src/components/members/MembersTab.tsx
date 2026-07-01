import { Table } from "@/components/retroui/Table";
import { useUIStore } from "@/stores/useUIStore";
import { Dialog } from "@/components/retroui/Dialog"
import { useLoginStore } from "@/stores/useLoginStore";
import { useMembers } from "@/hooks/useMembers";
import helper from "@/utils/helper";

 
const MembersTab = () => {
  const { user } = useLoginStore()
  const { players } = useMembers(user?.token)
  const { membersTabOpen, setMembersTabOpen } = useUIStore()

  console.log(players)

  return (
    <Dialog 
      open={membersTabOpen} 
      onOpenChange={setMembersTabOpen}
    >
      <Dialog.Content size='sm' className="h-96 border-2 border-black overflow-y-auto">
        <Table className="border-none shadow-none">
          <Table.Header className="sticky top-0 z-10 border-b-2 border-black">
            <Table.Row className="bg-card font-sans hover:bg-card">
              <Table.Head className="py-4 text-muted-foreground tracking-widest font-semibold">
                NAME
              </Table.Head>
              <Table.Head className="py-4 text-center text-muted-foreground tracking-widest font-semibold">
                RANK
              </Table.Head>
              <Table.Head className="py-4 text-center text-muted-foreground tracking-widest font-semibold">
                BIRTHDAY
              </Table.Head>
              <Table.Head className="py-4 text-center text-muted-foreground tracking-widest font-semibold">
                GENDER
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body className="[&_td]:py-4">
            {players.map((p) => (
              <Table.Row 
                key={p.id}
                className="border-b border-black hover:bg-muted bg-background"
              >
                <Table.Cell className="text-foreground">
                  {p.name}
                </Table.Cell>
                <Table.Cell className="text-foreground text-center">
                  {p.rank}
                </Table.Cell>
                <Table.Cell className="text-center text-foreground">
                  {helper.formatDate(p.birthday)}
                </Table.Cell>
                <Table.Cell className="text-center text-foreground">
                  {p.gender}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Dialog.Content>
    </Dialog>
  )
}

export default MembersTab